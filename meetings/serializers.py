import json
import datetime

from django.utils import timezone

from .models import Meeting, Breakout, Registration

def serialize_breakout(breakout):
    return {
        'id': breakout.pk,
        'title': breakout.title,
        'size': breakout.size,
        'participants': list(map(serialize_registration, breakout.registration_set.all())),
    }


def serialize_meeting(meeting):
    # TODO replace topic with title stored in model
    return {
        'zoom_id': meeting.zoom_id,
        'slug': meeting.slug,
        'short_code': meeting.short_code,
        'topic': json.loads(meeting.zoom_data).get('topic'),
        'breakouts': list(map(serialize_breakout, meeting.breakout_set.all().order_by('pk'))),
        'breakouts_frozen': meeting.breakouts_frozen,
        'registrants': list(map(serialize_registration, meeting.registration_set.all())),
        'presence': [],
    }


def serialize_registration(registration):
    # TODO email and join_url should maybe not be serialized by default!
    # TODO registration.zoom_data wont exist
    zoom_data = json.loads(registration.zoom_data)
    return {
        "id": registration.pk,
        "is_host": registration.is_host,
        "name": registration.name,
        "breakout_id": registration.breakout_id,
        "registrant_id": registration.registrant_id,
        "x": registration.x,
        "y": registration.y,
        "join_url": zoom_data.get('join_url'),
        "ws_active": not registration.ws_left_at and registration.ws_joined_at and (registration.ws_active_at - timezone.now() < datetime.timedelta(minutes=30)),
    }

