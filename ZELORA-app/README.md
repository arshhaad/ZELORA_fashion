# ZELORA Mobile App — Haute Horlogerie & Monochrome Couture

Official cross-platform React Native & Expo application for the **ZELORA** luxury editorial fashion house.

---

## 📱 Features

1. **Editorial Luxury Design System**:
   - Monochrome noir dark aesthetic (`#0B0B0B`), refined typography, and Atelier gold accents (`#C5A059`).
2. **Catalog & Search**:
   - Filter by luxury categories (Outerwear, Dresses, Tops, Trousers, Knitwear, Accessories).
   - Real-time catalog search and sorting (Newest Arrivals, Price Low-High, Price High-Low).
3. **Bespoke Product Details**:
   - High-resolution editorial image gallery with graceful fallbacks.
   - Atelier size selector (`XS`, `S`, `M`, `L`, `XL`).
   - Dual actions: **Add to Shopping Bag** and direct **Buy Now**.
4. **Direct Buy Now vs. Cart Checkout**:
   - **Buy Now**: Directly purchases a single garment without mutating or clearing the shopping bag.
   - **Cart Checkout**: Full multi-item bag checkout with automatic complimentary shipping and tax calculations.
5. **Private Wishlist Atelier**:
   - Save favorite pieces with one-tap heart toggle and persistent storage across app sessions.
6. **Live Orders & Tracking**:
   - Real-time order history, tracking badges (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
7. **ZELORA Luxury AI Concierge**:
   - Integrated floating AI assistant powered by Google Gemini & Groq.
   - Tailored personal styling consultations, sizing guidance, and order tracking queries.
8. **Client Account & Offline Persistence**:
   - Persistent JWT authentication (`AsyncStorage`) with silent 401 token auto-refresh.

---

## 🛠️ Project Structure

```
ZELORA-app/
├── assets/                    # App icons, splash screens, and images
├── src/
│   ├── api/
│   │   ├── client.js          # Fetch client with auto JWT injection & silent refresh
│   │   ├── authApi.js         # Login, register, profile, addresses
│   │   ├── productsApi.js     # Catalog search, filter, product details
│   │   ├── ordersApi.js       # Order creation & history
│   │   └── aiApi.js           # Luxury AI assistant integration
│   ├── context/
│   │   ├── AuthContext.js     # User session & credentials
│   │   ├── CartContext.js     # Shopping bag & direct Buy Now state
│   │   └── WishlistContext.js # Saved wardrobe items
│   ├── navigation/
│   │   ├── AppNavigator.js    # Root NativeStack navigator
│   │   └── TabNavigator.js    # Luxury bottom tab bar
│   ├── screens/
│   │   ├── home/HomeScreen.js
│   │   ├── shop/ShopScreen.js & ProductDetailScreen.js
│   │   ├── cart/CartScreen.js & CheckoutScreen.js
│   │   ├── orders/OrdersScreen.js & OrderSuccessScreen.js
│   │   ├── wishlist/WishlistScreen.js
│   │   ├── profile/ProfileScreen.js
│   │   ├── auth/LoginScreen.js & RegisterScreen.js
│   │   └── ai/AIChatScreen.js
│   ├── components/
│   │   ├── Header.js          # Editorial emblem header with bag badge & AI button
│   │   └── ProductCard.js     # Luxury 2-column card with discount pill & wishlist
│   ├── theme/
│   │   ├── colors.js          # Obsidian noir & Atelier gold palette
│   │   └── typography.js      # Editorial serif & sans-serif hierarchy
│   └── config.js              # Host IP & environment configuration
├── app.json
├── package.json
└── App.js                     # Root entry with safe area & state providers
```

---

## 🚀 How to Run

### 1. Ensure the Django Backend is Running
In the `backend/zelora` directory:
```powershell
backend\.venv\Scripts\python.exe backend\zelora\manage.py runserver 0.0.0.0:8000
```

### 2. Start the Expo Mobile App
Inside `ZELORA-app`:
```bash
cd ZELORA-app
npm start
```

### 3. Open on Your Device or Emulator
- **Physical Device (Android/iOS)**:
  1. Install the **Expo Go** app from Google Play Store or Apple App Store.
  2. Scan the QR code displayed in the terminal.
  3. Ensure your phone is connected to the same Wi-Fi network (`10.10.20.101`).
- **Android Emulator**: Press `a` in the terminal.
- **Web Preview**: Press `w` in the terminal.
