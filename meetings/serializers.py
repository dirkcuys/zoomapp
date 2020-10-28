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
    return {
        'zoom_id': meeting.zoom_id,
        'slug': meeting.slug,
        'short_code': meeting.short_code,
        'topic': json.loads(meeting.zoom_data).get('topic'),
        'breakouts': list(map(serialize_breakout, meeting.breakout_set.all())),
        'registrants': list(map(serialize_registration, meeting.registration_set.all())),
        'presence': [],
    }


def serialize_registration(registration):
    # TODO email and join_url should maybe not be serialized by default!
    zoom_data = json.loads(registration.zoom_data)
    return {
        "name": registration.name,
        "email": registration.email,
        "breakout_id": registration.breakout_id,
        "zoom_registrant_id": zoom_data.get('registrant_id'),
        "join_url": zoom_data.get('join_url'),
        "ws_active": not registration.ws_left_at and registration.ws_joined_at and (registration.ws_active_at - timezone.now() < datetime.timedelta(minutes=30)),
        "call_active": not registration.call_left_at and registration.call_joined_at,
    }

