from django.db import models

# Create your models here.
class ZoomUserToken(models.Model):
    zoom_user_id = models.CharField(max_length=256)
    access_token = models.CharField(max_length=1024)
    refresh_token = models.CharField(max_length=1024)
    zoom_api_data = models.TextField(default='{}')
