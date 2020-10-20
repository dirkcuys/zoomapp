from django.db import models

# Create your models here.

class Meeting(models.Model):
    pass


class Registration(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)


class Breakout(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
