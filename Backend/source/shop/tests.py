from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from decimal import Decimal
from .models import User, Product, Cart, CartItem, Order, OrderItem

User = get_user_model()


class UserModelTest(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )

    def test_user_creation(self):
        self.assertEqual(self.seller.username, 'seller1')
        self.assertEqual(self.seller.role, User.Role.SELLER)

    def test_is_seller_property(self):
        self.assertTrue(self.seller.is_seller)
        self.assertFalse(self.buyer.is_seller)

    def test_is_buyer_property(self):
        self.assertTrue(self.buyer.is_buyer)
        self.assertFalse(self.seller.is_buyer)

    def test_user_str(self):
        self.assertEqual(str(self.seller), 'seller1 (seller)')


class ProductModelTest(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Test Product',
            description='Test description',
            unit_price=Decimal('10.99'),
            quantity=50
        )

    def test_product_creation(self):
        self.assertEqual(self.product.title, 'Test Product')
        self.assertEqual(self.product.seller, self.seller)
        self.assertEqual(self.product.unit_price, Decimal('10.99'))

    def test_in_stock_property(self):
        self.assertTrue(self.product.in_stock)
        self.product.quantity = 0
        self.product.save()
        self.assertFalse(self.product.in_stock)

    def test_product_str(self):
        self.assertEqual(str(self.product), 'Test Product')


class CartModelTest(TestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.cart = Cart.objects.create(buyer=self.buyer)
        self.product = Product.objects.create(
            seller=self.seller,
            title='Test Product',
            unit_price=Decimal('10.99'),
            quantity=50
        )
        self.cart_item = CartItem.objects.create(
            cart=self.cart,
            product=self.product,
            quantity=3
        )

    def test_cart_creation(self):
        self.assertEqual(self.cart.buyer, self.buyer)

    def test_cart_total_property(self):
        expected_total = Decimal('10.99') * 3
        self.assertEqual(self.cart.total, expected_total)

    def test_cart_item_subtotal(self):
        expected_subtotal = Decimal('10.99') * 3
        self.assertEqual(self.cart_item.subtotal, expected_subtotal)

    def test_cart_item_str(self):
        self.assertEqual(str(self.cart_item), '3x Test Product')


class OrderModelTest(TestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Test Product',
            unit_price=Decimal('10.99'),
            quantity=50
        )
        self.order = Order.objects.create(
            buyer=self.buyer,
            total_amount=Decimal('32.97'),
            status=Order.Status.PENDING
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            quantity=3,
            unit_price=Decimal('10.99')
        )

    def test_order_creation(self):
        self.assertEqual(self.order.buyer, self.buyer)
        self.assertEqual(self.order.status, Order.Status.PENDING)

    def test_order_item_subtotal(self):
        expected_subtotal = Decimal('10.99') * 3
        self.assertEqual(self.order_item.subtotal, expected_subtotal)

    def test_order_str(self):
        self.assertIn(f'Order #{self.order.id}', str(self.order))


class RegistrationAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration_success(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': User.Role.BUYER,
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'newuser')

    def test_user_registration_password_mismatch(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'testpass123',
            'password2': 'differentpass',
            'role': User.Role.BUYER
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_username(self):
        User.objects.create_user(
            username='existing',
            email='existing@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )
        data = {
            'username': 'existing',
            'email': 'new@test.com',
            'password': 'testpass123',
            'password2': 'testpass123',
            'role': User.Role.BUYER
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AuthenticationAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )

    def test_login_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/token/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpass'
        }
        response = self.client.post('/api/token/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_me_endpoint_unauthenticated(self):
        response = self.client.get('/api/users/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ProductAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Test Product',
            description='Test description',
            unit_price=Decimal('10.99'),
            quantity=50
        )

    def test_list_products_authenticated(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_products_unauthenticated(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_product_as_seller(self):
        self.client.force_authenticate(user=self.seller)
        data = {
            'title': 'New Product',
            'description': 'New description',
            'unit_price': '15.99',
            'quantity': 100
        }
        response = self.client.post('/api/products/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

    def test_my_products_action(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.get('/api/products/my_products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['seller']['username'], 'seller1')

    def test_update_product_as_owner(self):
        self.client.force_authenticate(user=self.seller)
        data = {
            'title': 'Updated Product',
            'unit_price': '20.99',
            'quantity': 75
        }
        response = self.client.patch(f'/api/products/{self.product.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.title, 'Updated Product')

    def test_delete_product(self):
        self.client.force_authenticate(user=self.seller)
        response = self.client.delete(f'/api/products/{self.product.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Product.objects.count(), 0)


class CartAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Test Product',
            unit_price=Decimal('10.99'),
            quantity=50
        )

    def test_get_cart(self):
        self.client.force_authenticate(user=self.buyer)
        response = self.client.get('/api/cart/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['buyer']['username'], 'buyer1')

    def test_add_item_to_cart(self):
        self.client.force_authenticate(user=self.buyer)
        data = {
            'product_id': self.product.id,
            'quantity': 2
        }
        response = self.client.post('/api/cart/add_item/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CartItem.objects.count(), 1)

    def test_add_item_updates_quantity(self):
        self.client.force_authenticate(user=self.buyer)
        data = {
            'product_id': self.product.id,
            'quantity': 2
        }
        self.client.post('/api/cart/add_item/', data)
        response = self.client.post('/api/cart/add_item/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        cart_item = CartItem.objects.first()
        self.assertEqual(cart_item.quantity, 4)

    def test_remove_item_from_cart(self):
        self.client.force_authenticate(user=self.buyer)
        CartItem.objects.create(
            cart=Cart.objects.create(buyer=self.buyer),
            product=self.product,
            quantity=2
        )
        data = {'product_id': self.product.id}
        response = self.client.post('/api/cart/remove_item/', data)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_clear_cart(self):
        self.client.force_authenticate(user=self.buyer)
        cart = Cart.objects.create(buyer=self.buyer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        response = self.client.post('/api/cart/clear/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(CartItem.objects.count(), 0)


class OrderAPITest(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.buyer = User.objects.create_user(
            username='buyer1',
            email='buyer@test.com',
            password='testpass123',
            role=User.Role.BUYER
        )
        self.seller = User.objects.create_user(
            username='seller1',
            email='seller@test.com',
            password='testpass123',
            role=User.Role.SELLER
        )
        self.product = Product.objects.create(
            seller=self.seller,
            title='Test Product',
            unit_price=Decimal('10.99'),
            quantity=50
        )

    def test_create_order_from_cart(self):
        self.client.force_authenticate(user=self.buyer)
        cart = Cart.objects.create(buyer=self.buyer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=3)
        
        response = self.client.post('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_create_order_decrements_quantity(self):
        self.client.force_authenticate(user=self.buyer)
        cart = Cart.objects.create(buyer=self.buyer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=5)
        
        initial_quantity = self.product.quantity
        self.client.post('/api/orders/')
        self.product.refresh_from_db()
        self.assertEqual(self.product.quantity, initial_quantity - 5)

    def test_create_empty_cart_fails(self):
        self.client.force_authenticate(user=self.buyer)
        Cart.objects.create(buyer=self.buyer)
        
        response = self.client.post('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cart is empty', response.data['error'])

    def test_list_orders(self):
        self.client.force_authenticate(user=self.buyer)
        Order.objects.create(
            buyer=self.buyer,
            total_amount=Decimal('32.97'),
            status=Order.Status.PENDING
        )
        
        response = self.client.get('/api/orders/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_order_contains_correct_items(self):
        self.client.force_authenticate(user=self.buyer)
        cart = Cart.objects.create(buyer=self.buyer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=3)
        
        response = self.client.post('/api/orders/')
        order = Order.objects.first()
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.items.first().quantity, 3)

