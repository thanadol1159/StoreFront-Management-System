# StoreFront Management System

A full-stack e-commerce platform with separate seller and buyer roles, featuring product management, shopping cart, and order processing.

## Architecture Overview

This project follows a **monorepo** structure with two main applications:

### Backend (Django REST Framework)
- **Framework**: Django 5.x with Django REST Framework
- **Authentication**: JWT (JSON Web Tokens) using `djangorestframework-simplejwt`
- **Database**: SQLite (for development)
- **API Style**: RESTful API with ViewSets
- **File Upload**: Django ImageField with custom upload paths
- **CORS**: Configured for frontend-backend communication

### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors for token refresh
- **State Management**: React Context API (AuthContext, CartContext)
- **Styling**: CSS Modules

## Project Structure

```
StoreMesh/
├── Backend/
│   └── source/
│       ├── manage.py
│       ├── db.sqlite3
│       ├── media/              # Uploaded product images
│       ├── shop/               # Django app
│       │   ├── models.py       # User, Product, Cart, Order models
│       │   ├── serializers.py  # DRF serializers
│       │   ├── views.py        # API ViewSets
│       │   ├── admin.py        # Django admin configuration
│       │   ├── tests.py        # Unit tests
│       │   └── urls.py         # App URLs
│       └── source/             # Django project settings
│           ├── settings.py     # Project configuration
│           ├── urls.py         # Main URL patterns
│           ├── asgi.py
│           └── wsgi.py
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── client.ts       # Axios instance with interceptors
    │   │   └── services.ts     # API service functions
    │   ├── components/
    │   │   ├── layout/
    │   │   ├── product/
    │   │   ├── cart/
    │   │   └── ui/
    │   ├── context/
    │   │   ├── AuthContext.tsx # Authentication state
    │   │   └── CartContext.tsx # Shopping cart state
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   ├── ProductDetailPage.tsx
    │   │   ├── CartPage.tsx
    │   │   ├── OrderConfirmPage.tsx
    │   │   ├── SellerDashboardPage.tsx
    │   │   └── ProductFormPage.tsx
    │   ├── types/
    │   │   └── index.ts        # TypeScript type definitions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## Requirements

### Backend Requirements
- Python 3.12.6
- Django 5.x
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers

### Frontend Requirements
- Node.js (latest LTS recommended)
- npm or yarn
- React 19
- TypeScript 6.x
- Vite 8.x
- React Router 7.x
- Axios 1.x

## Environment Setup

### Backend Setup

1. **Navigate to the Backend directory**
```bash
cd Backend/source
```

2. **Create a virtual environment**
```bash
python -m venv venv
```

3. **Activate the virtual environment**

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

4. **Install Django and dependencies**
```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow
```

5. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

6. **Create a superuser (optional, for admin access)**
```bash
python manage.py createsuperuser
```

7. **Start the Django development server**
```bash
python manage.py runserver
```

The backend will be available at: `http://127.0.0.1:8000`

### Frontend Setup

1. **Navigate to the frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
Create a `.env` file in the frontend root directory:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

4. **Start the development server**
```bash
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Running the Application

1. Start the Django backend server (from `Backend/source`):
```bash
python manage.py runserver
```

2. Start the React frontend server (from `frontend`):
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/token/` - Login (obtain JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `GET /api/users/me/` - Get current user info (authenticated)

### Products
- `GET /api/products/` - List all active products
- `POST /api/products/` - Create new product (seller only)
- `GET /api/products/{id}/` - Get product details
- `PATCH /api/products/{id}/` - Update product (owner only)
- `DELETE /api/products/{id}/` - Delete product (owner only)
- `GET /api/products/my_products/` - List seller's products (seller only)

### Cart
- `GET /api/cart/` - Get current user's cart
- `POST /api/cart/add_item/` - Add item to cart
- `POST /api/cart/remove_item/` - Remove item from cart
- `POST /api/cart/clear/` - Clear cart

### Orders
- `GET /api/orders/` - List user's orders
- `POST /api/orders/` - Create order from cart
- `GET /api/orders/{id}/` - Get order details

### Admin
- `/admin/` - Django admin panel

## User Roles

### Seller
- Can create, update, and delete products
- Can view their own products in the seller dashboard
- Can upload product images

### Buyer
- Can browse and search products
- Can add products to cart
- Can place orders
- Can view order history

## Testing

### Backend Tests
Run the Django test suite:
```bash
cd Backend/source
python manage.py test shop
```

The test suite includes:
- Model tests (User, Product, Cart, Order)
- API tests (Registration, Authentication, Products, Cart, Orders)
- Business logic tests (quantity decrement, cart calculations)

### Frontend Tests
Currently, frontend tests are not implemented. You can add them using React Testing Library or similar tools.

## Database

The project uses SQLite for development. The database file is located at:
- `Backend/source/db.sqlite3`

To reset the database:
```bash
cd Backend/source
rm db.sqlite3
python manage.py migrate
```

## Media Files

Product images are stored in:
- `Backend/source/media/products/{seller_id}/{filename}`

Media files are served at:
- `http://127.0.0.1:8000/media/`

## Development Notes

- The backend uses SQLite for simplicity in development
- CORS is configured to allow requests from `http://localhost:5173`
- JWT access tokens expire after 50 minutes
- JWT refresh tokens expire after 1 day
- Product quantity is automatically decremented when an order is placed
- Cart is cleared after successful order creation

## Troubleshooting

### Backend Issues
- If you get database errors, try running migrations again: `python manage.py migrate`
- If media files aren't loading, ensure `MEDIA_URL` and `MEDIA_ROOT` are correctly configured in `settings.py`
- Check that CORS middleware is properly configured in `settings.py`

### Frontend Issues
- If API calls fail, check that the backend server is running on port 8000
- Verify the `VITE_API_URL` environment variable is set correctly
- Clear browser cache and localStorage if you encounter authentication issues

## Technology Stack

### Backend
- Django 5.x
- Django REST Framework
- djangorestframework-simplejwt
- django-cors-headers
- Pillow (for image handling)

### Frontend
- React 19
- TypeScript 6.x
- Vite 8.x
- React Router 7.x
- Axios 1.x

## License

This project is for educational purposes.
