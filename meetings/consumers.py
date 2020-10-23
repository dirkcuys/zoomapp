import json
import logging

from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync


logger = logging.getLogger(__name__)


class MeetingConsumer(WebsocketConsumer):
    def connect(self):
        self.meeting_slug = self.scope['url_route']['kwargs']['slug']
        self.meeting_group = f'meeting_{self.meeting_slug}'

        # Join meeting group
        async_to_sync(self.channel_layer.group_add)(
            self.meeting_group,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.meeting_group,
            self.channel_name
        )

    def receive(self, text_data):
        logger.error(text_data)

    # Receive message from room group
    def meeting_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps(message))
        #self.send(text_data=message)
