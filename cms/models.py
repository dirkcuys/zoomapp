from django.db import models
from tinymce.models import HTMLField

class Page(models.Model):
    key = models.CharField(max_length=256)
    title = models.CharField(max_length=256)
    content = HTMLField()

    def __str__(self):
        return self.key
