from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


def product_image_upload_path(instance, filename):
    return f'products/{instance.seller.id}/{filename}'


class User(AbstractUser):
    class Role(models.TextChoices):
        SELLER = "seller", "Seller"
        BUYER = "buyer", "Buyer"
 
    role = models.CharField(
        max_length=10,
        choices=Role.choices,
    )
 
    groups = models.ManyToManyField(
        "auth.Group",
        related_name="shop_users",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="shop_users",
        blank=True,
    )
 
    class Meta:
        db_table = "user"
 
    def __str__(self):
        return f"{self.username} ({self.role})"
 
    @property
    def is_seller(self):
        return self.role == self.Role.SELLER
 
    @property
    def is_buyer(self):
        return self.role == self.Role.BUYER
 
 
class Product(models.Model):
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="products",
        limit_choices_to={"role": User.Role.SELLER},
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    quantity = models.PositiveIntegerField(default=0)
    image = models.ImageField(
        upload_to=product_image_upload_path,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    class Meta:
        db_table = "product"
        ordering = ["-created_at"]
 
    def __str__(self):
        return self.title
 
    @property
    def in_stock(self):
        return self.quantity > 0
 
 
class Cart(models.Model):
    buyer = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cart",
        limit_choices_to={"role": User.Role.BUYER},
    )
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = "cart"
 
    def __str__(self):
        return f"Cart of {self.buyer.username}"
 
    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())
 
 
class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items",
    )
    quantity = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)],
    )
 
    class Meta:
        db_table = "cart_item"
        unique_together = ("cart", "product")
 
    def __str__(self):
        return f"{self.quantity}x {self.product.title}"
 
    @property
    def subtotal(self):
        return self.product.unit_price * self.quantity
 
 
class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
 
    buyer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="orders",
        limit_choices_to={"role": User.Role.BUYER},
    )
    total_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
    )
    ordered_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        db_table = "order"
        ordering = ["-ordered_at"]
 
    def __str__(self):
        return f"Order #{self.pk} by {self.buyer.username}"
 
 
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    quantity = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
    )
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )
 
    class Meta:
        db_table = "order_item"
 
    def __str__(self):
        return f"{self.quantity}x {self.product.title} @ {self.unit_price}"
 
    @property
    def subtotal(self):
        return self.unit_price * self.quantity