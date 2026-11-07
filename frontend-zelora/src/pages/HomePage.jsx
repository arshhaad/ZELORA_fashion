import Navbar from '../components/common/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ShopByCategory from '../components/home/ShopByCategory';
import NewArrivals from '../components/home/NewArrivals';
import TrendingProducts from '../components/home/TrendingProducts';
import SpecialOffers from '../components/home/SpecialOffers';
import RecommendedForYou from '../components/home/RecommendedForYou';
import RecentlyViewed from '../components/home/RecentlyViewed';
import FeaturesSection from '../components/landing/FeaturesSection';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';

export default function HomePage() {
  return (
    <div className="zelora-page-wrapper">
      <Toast />

      {/* Global Shared Navbar */}
      <Navbar />

      <main className="zelora-home-main">
        {/* 1. Hero Banner */}
        <HeroSection />

        {/* 2. Shop By Category */}
        <ShopByCategory />

        {/* 3. New Arrivals */}
        <NewArrivals />

        {/* 4. Trending Products */}
        <TrendingProducts />

        {/* 5. Special Offers (with Countdown) */}
        <SpecialOffers />

        {/* 6. Recommended For You */}
        <RecommendedForYou />

        {/* 7. Recently Viewed */}
        <RecentlyViewed />

        {/* Features Trust Indicators */}
        <FeaturesSection />
      </main>

      {/* 8. Global Shared Footer */}
      <Footer />
    </div>
  );
}

