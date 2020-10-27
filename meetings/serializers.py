import json

from .models import Meeting, Breakout, Registration
#from rest_framework import serializers


#class MeetingSerializer(serializers.HyperlinkedModelSerializer):
#    class Meta:
#        model = Meeting
#        fields = ['url', 'username', 'email', 'groups']


#class BreakoutSerialize(serializers.ModelSerializer):
#    class Meta:
#        model = Breakout
#        fields = ['id', 'title', 'size']


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
    }

