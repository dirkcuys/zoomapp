from django.db import models

# Create your models here.


class Meeting(models.Model):
    slug = models.SlugField()
    short_code = models.CharField(max_length=64)
    zoom_id = models.CharField(max_length=256, blank=True)
    zoom_host_id = models.CharField(max_length=256, blank=True)
    zoom_data = models.TextField()
    title=models.CharField(max_length=256, blank=True)
    breakouts_frozen = models.BooleanField(default=False)
    manual_transfer = models.BooleanField(default=False)

    def __str__(self):
        return f'[{self.slug}] {self.title}'


class Breakout(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    title = models.CharField(max_length=256)
    size = models.IntegerField(default=8)


class Registration(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE)
    registrant_id = models.CharField(max_length=256, blank=True)
    is_host = models.BooleanField(default=False)
    email = models.EmailField()
    name = models.CharField(max_length=256)
    breakout = models.ForeignKey(Breakout, null=True, on_delete=models.SET_NULL)
    x = models.PositiveSmallIntegerField(default=0)
    y = models.PositiveSmallIntegerField(default=0)
    ws_joined_at = models.DateTimeField(blank=True, null=True)
    ws_left_at = models.DateTimeField(blank=True, null=True)
    ws_active_at = models.DateTimeField(blank=True, null=True)
    zoom_data = models.TextField()
    zoom_id = models.CharField(max_length=256)
    # TODO remove below
    call_joined_at = models.DateTimeField(blank=True, null=True)
    call_left_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.name

