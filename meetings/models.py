from django.db import models

# Create your models here.

class Meeting(models.Model):
    zoom_id = models.CharField(max_length=256)
    zoom_host_id = models.CharField(max_length=256)
    slug = models.SlugField()


class Registration(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    name = models.CharField(max_length=256)
    email = models.EmailField()


class Breakout(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    title = models.CharField(max_length=256)
    size = models.IntegerField(default=8)
