import json
import logging

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
            # TODO this leaks join URL to other users
            self.user = serialize_registration(registration)
        elif self.scope["session"].get('zoom_user'):
            self.user = {}
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
                'message': {'type': 'ADD_PRESENCE', 'payload': self.user }
            }
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.meeting_group,
            self.channel_name
        )

    def receive(self, text_data):
        logger.error(text_data)

    # Receive message from channels layer and forward to connected ws client
    def meeting_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps(message))
