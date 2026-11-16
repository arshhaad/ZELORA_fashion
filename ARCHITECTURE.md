# ZELORA — System Architecture & Workflow Specifications

This document outlines the high-level system architecture, security workflows, data entity relationships, and transaction lifecycles powering the **ZELORA** Luxury Fashion Platform.

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Clients & Presentation Tier"]
        WebClient["React 19 + Vite (Web Storefront & Portals)"]
        MobileClient["React Native (ZELORA Mobile App)"]
    end

    subgraph GatewayLayer["API & Security Boundary"]
        CORS["Django CORS Middleware"]
        AuthGuard["JWT & RBAC Gatekeeper"]
    end

    subgraph ServiceLayer["Django Backend Core (backend/zelora)"]
        AuthService["Auth & Identity Service\n(Google OAuth, OTP, JWT)"]
        CatalogService["Product & Catalog Engine\n(Search, Filters, Inventory)"]
        OrderService["Order & Checkout Manager\n(GST, Cart, Buy Now)"]
        SellerService["Seller Atelier Service\n(Shop Profile, Payouts)"]
        AIService["ZELORA AI Assistant\n(Groq LLM Integration)"]
    end

    subgraph ExternalServices["External Infrastructure & Providers"]
        GoogleOIDC["Google Identity Services (OAuth 2.0)"]
        GoogleSMTP["Google SMTP Server (6-Digit OTP Delivery)"]
        RazorpayGateway["Razorpay Payment Gateway"]
        GroqAPI["Groq Llama 3 Fast Inference API"]
    end

    subgraph PersistenceLayer["Data Storage & Assets"]
        Database[("PostgreSQL / SQLite Database")]
        StaticAssets["Media & Product Image Storage"]
    end

    WebClient --> GatewayLayer
    MobileClient --> GatewayLayer

    GatewayLayer --> ServiceLayer

    AuthService --> GoogleOIDC
    AuthService --> GoogleSMTP
    OrderService --> RazorpayGateway
    AIService --> GroqAPI

    ServiceLayer --> Database
    CatalogService --> StaticAssets
```

---

## 2. Multi-Role Authentication & Access Control

ZELORA enforces strict role separation across three primary user roles:
- **Client / Customer**: Browses catalog, places orders, manages profile.
- **Boutique Atelier / Seller**: Manages inventory, fulfills bespoke orders, analyzes payouts.
- **Executive Administrator**: Platform moderation, seller verification, commission configuration.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Atelier Seller
    participant App as React Frontend
    participant API as Django API (/api/auth)
    participant Google as Google Identity Services
    participant Mail as Google SMTP Server
    participant DB as Database

    alt Google OAuth 2.0 Sign-In
        User->>App: Clicks "Continue with Google"
        App->>Google: Authenticates patron credentials
        Google-->>App: Returns ID token / Access token
        App->>API: POST /api/auth/google/ (token, is_seller)
        API->>DB: Verify or create user with auth_provider='google'
        API-->>App: 200 OK + JWT Pair (Access + Refresh) + Shop Profile
        App->>App: Store tokens & initialize SellerContext / AuthContext
    else Email + OTP Password Reset / Verification
        User->>App: Submits email on Forgot Password
        App->>API: POST /api/auth/forgot-password/
        API->>DB: Generate 6-Digit PasswordResetCode
        API->>Mail: Dispatch branded security email
        Mail-->>User: Delivers 6-digit OTP to inbox
        User->>App: Inputs 6-digit OTP PIN
        App->>API: POST /api/auth/verify-reset-otp/
        API-->>App: 200 OK (OTP verified)
        User->>App: Sets new password
        App->>API: POST /api/auth/reset-password/
        API->>DB: user.set_password(new_pass)
        API-->>App: 200 OK (Password successfully reset)
    end
```

---

## 3. Order Placement & Checkout Lifecycle

```mermaid
flowchart TD
    StartStep([User Selects Item]) --> Choice{"Action"}
    Choice -->|"Add to Bag"| BagFlow["Cart Page (CartContext)"]
    Choice -->|"Buy Now"| DirectFlow["Direct Buy Now (Isolated Session)"]

    BagFlow --> CalcStep["Calculate Subtotal\nSum of (product.price * qty)"]
    DirectFlow --> CalcStep

    CalcStep --> FulfillmentDecision{"Fulfillment Mode"}
    FulfillmentDecision -->|"Doorstep Courier"| CourierRoute["Delivery Charge\n(FREE if > ₹500, else ₹50)"]
    FulfillmentDecision -->|"Atelier Pickup"| PickupRoute["Complimentary Atelier Visit (₹0)"]

    CourierRoute --> TaxCalc["Inclusive 5% Luxury GST Verified"]
    PickupRoute --> TaxCalc

    TaxCalc --> FinalAmount["Final Payable = Subtotal + Delivery Charge"]

    FinalAmount --> PayChoice{"Payment Selection"}
    PayChoice -->|"Razorpay Online"| RzpFlow["Trigger Razorpay Checkout Modal"]
    RzpFlow -->|"Payment Success"| OrderCreate["POST /api/orders/create/"]
    PayChoice -->|"Cash on Delivery / Pay at Atelier"| OrderCreate

    OrderCreate --> OrderCreated[("Order Stored in DB")]
    OrderCreated --> SellerNotif["Seller Receives Order in Orders Portal"]
```

---

## 4. Seller Order Fulfillment State Machine

```mermaid
stateDiagram-v2
    [*] --> Pending: Client places order
    Pending --> Confirmed: Atelier accepts order
    Pending --> Cancelled: Atelier declines (out of stock/unreachable)
    Confirmed --> Processing: Garment tailoring & packaging
    Processing --> Shipped: Blue Dart / Express tracking assigned
    Shipped --> OutForDelivery: Local courier dispatched
    OutForDelivery --> Delivered: Client receives couture garment
    Delivered --> [*]
    Cancelled --> [*]
```

---

## 5. Database Entity-Relationship Model

```mermaid
erDiagram
    USER ||--o{ SELLER_SHOP : owns
    USER ||--o{ ORDER : places
    USER ||--o{ ADDRESS : has
    USER ||--o{ PASSWORD_RESET_CODE : requests
    SELLER_SHOP ||--o{ PRODUCT : lists
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : referenced_by
    PRODUCT }|--|| CATEGORY : belongs_to

    USER {
        int id PK
        string email UK
        string first_name
        string last_name
        boolean is_seller
        boolean is_email_verified
        string auth_provider
        string shop_name
    }

    SELLER_SHOP {
        int id PK
        int owner_id FK
        string name
        string category
        string contact_email
        boolean is_open
    }

    PRODUCT {
        int id PK
        int shop_id FK
        string title
        float price
        float original_price
        int stock_quantity
        string primary_image
        boolean is_published
    }

    ORDER {
        int id PK
        string order_id UK
        int customer_id FK
        float total_amount
        string order_status
        string payment_status
        string payment_method
        datetime created_at
    }

    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        float unit_price
        string size
        string color
    }
```

---

## 6. Frontend State Architecture & Context Isolation

```mermaid
flowchart LR
    subgraph GlobalProviders["Root React Context Hierarchy"]
        AuthProvider["AuthContext\n(Customer Token & Session)"]
        SellerProvider["SellerContext\n(Atelier Token, Shop, Orders)"]
        CartProvider["CartContext\n(Bag Items, Subtotal, Delivery)"]
        WishlistProvider["WishlistContext\n(Saved Pieces)"]
    end

    subgraph ConsumerRoutes["Route Boundaries"]
        StoreRoutes["Customer Storefront (/products, /cart, /checkout)"]
        SellerRoutes["Seller Protected Route (/seller/dashboard, /seller/orders)"]
        AdminRoutes["Admin Protected Route (/admin/*)"]
    end

    AuthProvider -.-> StoreRoutes
    CartProvider -.-> StoreRoutes
    WishlistProvider -.-> StoreRoutes
    SellerProvider -.-> SellerRoutes
```
