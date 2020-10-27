import django.dispatch

class ZoomApp:
    pass

zoom_webhook = django.dispatch.Signal()
