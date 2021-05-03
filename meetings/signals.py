import logging

from django.utils import timezone

from zoom.signals import zoom_webhook, ZoomApp
from .models import Registration


logger = logging.getLogger(__name__)


def handle_zoom_webhook(sender, event, payload, **kwargs):
    if event == "meeting.participant_joined":
        pass

    if event == "meeting.participant_left":
        pass

zoom_webhook.connect(handle_zoom_webhook, sender=ZoomApp)
