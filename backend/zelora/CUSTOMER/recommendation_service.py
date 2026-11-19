"""
ZELORA Redis-Powered Luxury Product Recommendation Engine
=========================================================
Delivers real-time personalized recommendations, item-to-item co-occurrence
("customers who viewed this also viewed"), category trending rankings, and sub-millisecond
cached recommendations backed by Redis In-Memory Data Structures (Sorted Sets, Lists, Key-Value).
"""

import json
import logging
from typing import List, Dict, Any, Optional
from django.core.cache import cache
from django.db.models import Q
from .models import Product

logger = logging.getLogger(__name__)

# Redis Key Conventions
KEY_PREFIX = "zelora:rec"
KEY_USER_HISTORY = f"{KEY_PREFIX}:history:{{identifier}}"       # List of recently viewed product IDs
KEY_USER_PREF_CAT = f"{KEY_PREFIX}:pref_cat:{{identifier}}"     # Sorted Set of category preference scores
KEY_USER_PREF_GENDER = f"{KEY_PREFIX}:pref_gen:{{identifier}}"  # Sorted Set of gender preference scores
KEY_ITEM_COOCCUR = f"{KEY_PREFIX}:cooccur:{{product_id}}"       # Sorted Set: other products co-viewed with this product
KEY_TRENDING_GLOBAL = f"{KEY_PREFIX}:trending:all"              # Sorted Set: top viewed products globally
KEY_TRENDING_CAT = f"{KEY_PREFIX}:trending:cat:{{category}}"    # Sorted Set: top products in a specific category
KEY_CACHE_PERSONAL = f"{KEY_PREFIX}:cache:personal:{{identifier}}:{{limit}}"
KEY_CACHE_RELATED = f"{KEY_PREFIX}:cache:related:{{product_id}}:{{limit}}"

# TTL constants (seconds)
TTL_CACHE_SHORT = 300          # 5 minutes
TTL_CACHE_MEDIUM = 1800        # 30 minutes
TTL_USER_SESSION = 2592000     # 30 days
TTL_TRENDING = 604800          # 7 days


class RedisRecommendationEngine:
    """
    High-performance recommendation engine using Redis Sorted Sets and Caches.
    Fails open gracefully to database queries if Redis is offline or cold.
    """

    @classmethod
    def get_redis_client(cls):
        """Returns the raw Redis client if connected, or None if offline."""
        try:
            from django_redis import get_redis_connection
            client = get_redis_connection("default")
            # Quick lightweight ping with timeout check
            client.ping()
            return client
        except Exception as e:
            logger.debug(f"Redis connection unavailable for direct commands: {e}")
            return None

    @classmethod
    def track_product_interaction(
        cls,
        product_id: str,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        interaction_type: str = "view"
    ) -> Dict[str, Any]:
        """
        Records a product view or cart interaction in Redis.
        Updates:
          1. User's view history and category/gender affinity.
          2. Co-occurrence graph between current product and user's last viewed product.
          3. Global and category-specific trending rankings.
        """
        try:
            product = Product.objects.filter(id=product_id).first()
            if not product:
                return {"status": "skipped", "reason": "product_not_found"}

            identifier = f"user_{user_id}" if user_id else f"sess_{session_id or 'anon'}"
            category_slug = (product.category or "apparel").strip().lower()
            gender_slug = (product.gender or "unisex").strip().lower()

            # Weight score by interaction (cart addition has higher recommendation weight than view)
            weight = 3.0 if interaction_type in ("cart", "purchase") else 1.0

            r = cls.get_redis_client()
            if r:
                pipe = r.pipeline()

                # 1. User History (capped at 20 most recent interactions)
                history_key = KEY_USER_HISTORY.format(identifier=identifier)
                pipe.lrem(history_key, 0, product_id)
                pipe.lpush(history_key, product_id)
                pipe.ltrim(history_key, 0, 19)
                pipe.expire(history_key, TTL_USER_SESSION)

                # 2. User category and gender affinity scores
                cat_key = KEY_USER_PREF_CAT.format(identifier=identifier)
                gen_key = KEY_USER_PREF_GENDER.format(identifier=identifier)
                pipe.zincrby(cat_key, weight, category_slug)
                pipe.expire(cat_key, TTL_USER_SESSION)
                pipe.zincrby(gen_key, weight, gender_slug)
                pipe.expire(gen_key, TTL_USER_SESSION)

                # 3. Trending rankings
                pipe.zincrby(KEY_TRENDING_GLOBAL, weight, product_id)
                pipe.expire(KEY_TRENDING_GLOBAL, TTL_TRENDING)
                cat_trending_key = KEY_TRENDING_CAT.format(category=category_slug)
                pipe.zincrby(cat_trending_key, weight, product_id)
                pipe.expire(cat_trending_key, TTL_TRENDING)

                # 4. Item Co-occurrence with previous items in user's history
                # Fetch recent products from the history list
                prev_items = r.lrange(history_key, 1, 3)
                if prev_items:
                    for prev_id_bytes in prev_items:
                        prev_id = prev_id_bytes.decode("utf-8") if isinstance(prev_id_bytes, bytes) else str(prev_id_bytes)
                        if prev_id and prev_id != product_id:
                            co_key_1 = KEY_ITEM_COOCCUR.format(product_id=prev_id)
                            co_key_2 = KEY_ITEM_COOCCUR.format(product_id=product_id)
                            pipe.zincrby(co_key_1, 1.0, product_id)
                            pipe.zincrby(co_key_2, 1.0, prev_id)
                            pipe.expire(co_key_1, TTL_TRENDING)
                            pipe.expire(co_key_2, TTL_TRENDING)

                pipe.execute()

                # Invalidate cached personal recommendation for this user so fresh interests reflect
                cache.delete(KEY_CACHE_PERSONAL.format(identifier=identifier, limit=4))
                cache.delete(KEY_CACHE_PERSONAL.format(identifier=identifier, limit=8))

            return {
                "status": "tracked",
                "engine": "redis" if r else "fallback",
                "product_id": product_id,
                "interaction": interaction_type
            }
        except Exception as e:
            logger.warning(f"Error in Redis track_product_interaction: {e}")
            return {"status": "error", "message": str(e)}

    @classmethod
    def get_personalized_recommendations(
        cls,
        user_id: Optional[int] = None,
        session_id: Optional[str] = None,
        limit: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Generates personalized product recommendations based on Redis interaction graphs.
        Combines:
          1. Co-occurring items from user's recently viewed products.
          2. Trending products from user's preferred categories.
          3. Global top-trending items.
        """
        identifier = f"user_{user_id}" if user_id else f"sess_{session_id or 'anon'}"
        cache_key = KEY_CACHE_PERSONAL.format(identifier=identifier, limit=limit)

        # 1. Fast Cache Hit
        try:
            cached = cache.get(cache_key)
            if cached and isinstance(cached, list) and len(cached) > 0:
                return cached
        except Exception:
            pass

        recommended_ids = []
        r = cls.get_redis_client()

        if r:
            try:
                # 2. Get user's recent product history
                history_key = KEY_USER_HISTORY.format(identifier=identifier)
                recent_ids_raw = r.lrange(history_key, 0, 4)
                recent_ids = [i.decode('utf-8') if isinstance(i, bytes) else str(i) for i in recent_ids_raw]

                # 3. Pull co-occurrence recommendations for recently viewed items
                for pid in recent_ids:
                    cooccur_key = KEY_ITEM_COOCCUR.format(product_id=pid)
                    co_items_raw = r.zrevrange(cooccur_key, 0, limit - 1)
                    for item_raw in co_items_raw:
                        item_id = item_raw.decode('utf-8') if isinstance(item_raw, bytes) else str(item_raw)
                        if item_id not in recommended_ids and item_id not in recent_ids:
                            recommended_ids.append(item_id)
                            if len(recommended_ids) >= limit:
                                break
                    if len(recommended_ids) >= limit:
                        break

                # 4. Fill remaining slots with trending items from user's top categories
                if len(recommended_ids) < limit:
                    cat_key = KEY_USER_PREF_CAT.format(identifier=identifier)
                    top_cats_raw = r.zrevrange(cat_key, 0, 2)
                    top_cats = [c.decode('utf-8') if isinstance(c, bytes) else str(c) for c in top_cats_raw]

                    for cat in top_cats:
                        cat_trend_key = KEY_TRENDING_CAT.format(category=cat)
                        trend_items_raw = r.zrevrange(cat_trend_key, 0, limit - 1)
                        for item_raw in trend_items_raw:
                            item_id = item_raw.decode('utf-8') if isinstance(item_raw, bytes) else str(item_raw)
                            if item_id not in recommended_ids and item_id not in recent_ids:
                                recommended_ids.append(item_id)
                                if len(recommended_ids) >= limit:
                                    break
                        if len(recommended_ids) >= limit:
                            break

                # 5. Fill any remaining slots with global Redis trending items
                if len(recommended_ids) < limit:
                    global_trend_raw = r.zrevrange(KEY_TRENDING_GLOBAL, 0, limit * 2)
                    for item_raw in global_trend_raw:
                        item_id = item_raw.decode('utf-8') if isinstance(item_raw, bytes) else str(item_raw)
                        if item_id not in recommended_ids:
                            recommended_ids.append(item_id)
                            if len(recommended_ids) >= limit:
                                break
            except Exception as e:
                logger.warning(f"Error querying Redis recommendation sets: {e}")

        # 6. Database Hydration & Cold-Start Fallback
        products_list = []
        if recommended_ids:
            found_products = {p.id: p for p in Product.objects.filter(id__in=recommended_ids, in_stock=True)}
            for pid in recommended_ids:
                if pid in found_products:
                    item_dict = found_products[pid].to_dict()
                    item_dict["isRecommended"] = True
                    item_dict["recommendation_source"] = "redis_personalized"
                    products_list.append(item_dict)

        # If still short, fallback to high-rated featured products
        if len(products_list) < limit:
            existing_ids = {p["id"] for p in products_list}
            fallback_qs = Product.objects.filter(in_stock=True).exclude(id__in=existing_ids).order_by('-is_featured', '-rating', '-review_count')[:limit - len(products_list)]
            for p in fallback_qs:
                p_dict = p.to_dict()
                p_dict["isRecommended"] = True
                p_dict["recommendation_source"] = "redis_trending_fallback"
                products_list.append(p_dict)
                # Seed into Redis global trending set for subsequent calls
                if r:
                    try:
                        r.zincrby(KEY_TRENDING_GLOBAL, 1.0, p.id)
                    except Exception:
                        pass

        # 7. Cache in Redis
        try:
            cache.set(cache_key, products_list, timeout=TTL_CACHE_MEDIUM)
        except Exception:
            pass

        return products_list[:limit]

    @classmethod
    def get_related_products(
        cls,
        product_id: str,
        limit: int = 4
    ) -> List[Dict[str, Any]]:
        """
        Retrieves products related to a specific product using:
          1. Co-occurrence graph from Redis ("viewed together").
          2. Category trending items from Redis.
          3. Same-category database items.
        """
        cache_key = KEY_CACHE_RELATED.format(product_id=product_id, limit=limit)

        try:
            cached = cache.get(cache_key)
            if cached and isinstance(cached, list) and len(cached) > 0:
                return cached
        except Exception:
            pass

        recommended_ids = []
        r = cls.get_redis_client()

        if r:
            try:
                # 1. Co-occurrence lookup
                cooccur_key = KEY_ITEM_COOCCUR.format(product_id=product_id)
                co_raw = r.zrevrange(cooccur_key, 0, limit - 1)
                for item_raw in co_raw:
                    item_id = item_raw.decode('utf-8') if isinstance(item_raw, bytes) else str(item_raw)
                    if item_id != product_id and item_id not in recommended_ids:
                        recommended_ids.append(item_id)

                # 2. Category trending lookup if not enough co-occurring items
                if len(recommended_ids) < limit:
                    product = Product.objects.filter(id=product_id).first()
                    if product and product.category:
                        cat_slug = product.category.strip().lower()
                        cat_trend_key = KEY_TRENDING_CAT.format(category=cat_slug)
                        cat_items_raw = r.zrevrange(cat_trend_key, 0, limit)
                        for item_raw in cat_items_raw:
                            item_id = item_raw.decode('utf-8') if isinstance(item_raw, bytes) else str(item_raw)
                            if item_id != product_id and item_id not in recommended_ids:
                                recommended_ids.append(item_id)
                                if len(recommended_ids) >= limit:
                                    break
            except Exception as e:
                logger.warning(f"Error querying Redis related products: {e}")

        # 3. Hydrate from database
        products_list = []
        if recommended_ids:
            found_products = {p.id: p for p in Product.objects.filter(id__in=recommended_ids, in_stock=True)}
            for pid in recommended_ids:
                if pid in found_products:
                    item_dict = found_products[pid].to_dict()
                    item_dict["recommendation_source"] = "redis_cooccurrence"
                    products_list.append(item_dict)

        # 4. Fallback to same-category/gender products if needed
        if len(products_list) < limit:
            current_prod = Product.objects.filter(id=product_id).first()
            existing_ids = {p["id"] for p in products_list} | {product_id}
            qs = Product.objects.filter(in_stock=True).exclude(id__in=existing_ids)

            if current_prod:
                if current_prod.category:
                    qs_cat = qs.filter(category__iexact=current_prod.category).order_by('-rating', '-review_count')
                    for p in qs_cat[:limit - len(products_list)]:
                        p_dict = p.to_dict()
                        p_dict["recommendation_source"] = "redis_category_similar"
                        products_list.append(p_dict)
                        existing_ids.add(p.id)

            if len(products_list) < limit:
                remaining = qs.exclude(id__in=existing_ids).order_by('-is_featured', '-rating')[:limit - len(products_list)]
                for p in remaining:
                    p_dict = p.to_dict()
                    p_dict["recommendation_source"] = "redis_general_similar"
                    products_list.append(p_dict)

        # 5. Cache result in Redis
        try:
            cache.set(cache_key, products_list, timeout=TTL_CACHE_MEDIUM)
        except Exception:
            pass

        return products_list[:limit]
