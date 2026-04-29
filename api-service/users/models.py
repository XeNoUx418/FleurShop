from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('admin',    'Admin'),
    ]
    role  = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        # CRITICAL — tells Django this table already exists
        # managed by auth-service, don't touch it
        managed = False
        db_table = 'users_customuser'