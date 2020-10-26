from django.db import models

# Create your models here.

class Meeting(models.Model):
    slug = models.SlugField()
    zoom_id = models.CharField(max_length=256)
    zoom_host_id = models.CharField(max_length=256)
    zoom_data = models.TextField()


class Breakout(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    title = models.CharField(max_length=256)
    size = models.IntegerField(default=8)


class Registration(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    email = models.EmailField()
    name = models.CharField(max_length=256)
    breakout = models.ForeignKey(Breakout, null=True, on_delete=models.SET_NULL)
    zoom_data = models.TextField()
