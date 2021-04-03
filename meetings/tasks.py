import logging

from celery import shared_task

logger = logging.getLogger('request')

@shared_task(name='create_zoom_registrations')
def create_zoom_registrations(meeting):
    pass
