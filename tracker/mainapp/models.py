from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    # inherits from AbstractUser, it will already have fields for a username, email, password
    pass