import logging

from django.utils import timezone

from zoom.signals import zoom_webhook, ZoomApp
from .models import Registration


logger = logging.getLogger(__name__)


def handle_zoom_webhook(sender, event, payload, **kwargs):
    if event == "meeting.participant_joined":
        meeting_id = payload.get('object', {}).get('id')
        participant_id = payload.get('object', {}).get('participant', {}).get('user_id')
        Registration.objects.filter(meeting_id=meeting_id, zoom_id=participant_id).update(
            call_joined_at=timezone.now(), call_left_at=None
        )
        #data = {
        #    "payload":{
        #        "account_id":"xxxxxxxxxxxxxxxxxxx_7Q",
        #        "object": {
        #            "uuid":"DLQxxxxxxxxxxxxxxxxwDA==",
        #            "participant":{
        #                "user_id":"16780288",
        #                "user_name":"Zaoomm",
        #                 "id":"",
        #                 "join_time":"2020-10-16T15:57:44Z"
        #            },
        #            "id":"82628613951",
        #            "type":1,
        #            "topic":"Zoom Meeting",
        #            "host_id":"CvxxxxxxxxxxxxxxxxxxmQ",
        #            "duration":0,
        #            "start_time":"2020-10-16T15:49:01Z",
        #            "timezone":""
        #        }
        #    },
        #    "event":"meeting.participant_joined"
        #}


    if event == "meeting.participant_left":
        meeting_id = payload.get('object', {}).get('id')
        participant_id = payload.get('object', {}).get('participant', {}).get('user_id')
        Registration.objects.filter(meeting_id=meeting_id, zoom_id=participant_id).update(
            call_left_at=timezone.now()
        )
        #   {"payload":{"account_id":"xxxxxxxxxxxxxxxxxxx_7Q","object":{"uuid":"DLQxxxxxxxxxxxxxxxxwDA==","participant":{"leave_time":"2020-10-16T15:59:02Z","user_id":"16780288","user_name":"Zaoomm"},"id":"82628613951","type":1,"topic":"Zoom Meeting","host_id":"CvxxxxxxxxxxxxxxxxxxmQ","duration":0,"start_time":"2020-10-16T15:49:01Z","timezone":""}},"event":"meeting.participant_left"}

zoom_webhook.connect(handle_zoom_webhook, sender=ZoomApp)
