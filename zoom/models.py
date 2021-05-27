from django.db import models
from django_cryptography.fields import encrypt

# Create your models here.
class ZoomUserToken(models.Model):
    zoom_user_id = models.CharField(max_length=256)

    access_token = encrypt(models.CharField(max_length=1024))
    refresh_token = encrypt(models.CharField(max_length=1024))
    zoom_api_data = encrypt(models.TextField(default='{}'))
