import logging
import channels.layers
from asgiref.sync import async_to_sync
from .serializers import serialize_meeting, serialize_registration, serialize_breakout
from celery import shared_task

logger = logging.getLogger('request')

@shared_task(name='create_zoom_registrations')
def create_zoom_registrations(meeting):
    # register users
    # TODO this should be done async
    for user in meeting.registration_set.all():
        registration_data = {
            "email": user.email,
            'first_name': user.name
        }
        resp = zoom_post(f'/meetings/{meeting.zoom_id}/registrants', zoom_auth, registration_data)
        logger.error(resp.json())
        zoom_registration = resp.json()
        user.registrant_id = zoom_registration.get('registrant_id', '')
        user.zoom_data = json.dumps(zoom_registration)
        user.save()

    from .views import _ws_update_meeting
    _ws_update_meeting(meeting)

    pass
