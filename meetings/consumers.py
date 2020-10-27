import json
import logging

from django.utils import timezone

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from .models import Registration
from .serializers import serialize_registration

logger = logging.getLogger(__name__)


class MeetingConsumer(WebsocketConsumer):
    def connect(self):
        self.meeting_slug = self.scope['url_route']['kwargs']['slug']
        self.meeting_group = f'meeting_{self.meeting_slug}'

        if self.scope["session"].get('user_registration'):
            email = self.scope["session"].get('user_registration')
            registration = Registration.objects.get(email=email, meeting__slug=self.meeting_slug)
            registration.ws_joined_at = timezone.now()
            registration.ws_active_at = registration.ws_joined_at
            registration.ws_left_at = None
            registration.save()
        elif self.scope["session"].get('zoom_user'):
            pass
        else:
            logger.error(self.scope['session'].get('zoom_user'))
            raise Exception('No user found!')

        # Join meeting group
        async_to_sync(self.channel_layer.group_add)(
            self.meeting_group,
            self.channel_name
        )

        async_to_sync(self.channel_layer.group_send)(
            self.meeting_group,
            {
                'type': 'meeting_message',
                'message': {'type': 'SET_REGISTRANTS', 'payload': list(map(serialize_registration, registration.meeting.registration_set.all()))}
            }
        )

        self.accept()

    def disconnect(self, close_code):
        email = self.scope["session"].get('user_registration')
        Registration.objects.filter(email=email, meeting__slug=self.meeting_slug).update(
            ws_left_at=timezone.now()
        )
        registration = Registration.objects.get(email=email, meeting__slug=self.meeting_slug)

        async_to_sync(self.channel_layer.group_send)(
            self.meeting_group,
            {
                'type': 'meeting_message',
                'message': {'type': 'SET_REGISTRANTS', 'payload': list(map(serialize_registration, registration.meeting.registration_set.all()))}
            }
        )

        async_to_sync(self.channel_layer.group_discard)(
            self.meeting_group,
            self.channel_name
        )

    def receive(self, text_data):
        email = self.scope["session"].get('user_registration')
        Registration.objects.filter(email=email, meeting__slug=self.meeting_slug).update(
            ws_active_at=timezone.now()
        )
        logger.error(text_data)

    # Receive message from channels layer and forward to connected ws client
    def meeting_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps(message))
