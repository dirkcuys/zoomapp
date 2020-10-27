import json
import logging
import string
import random

from django.shortcuts import render
from django import http
from asgiref.sync import async_to_sync
import channels.layers

from zoom.api import zoom_post, zoom_get, zoom_patch
from zoom.models import ZoomUserToken
from .models import Meeting
from .models import Breakout
from .models import Registration
from .decorators import registration_required, host_required
from .serializers import serialize_meeting, serialize_registration, serialize_breakout


logger = logging.getLogger(__name__)


def index(request):
    context = {}
    context['react_props'] = {"zoomUser": request.session.get('zoom_user')}
    return render(request, 'meetings/index.html', context)


def create(request):
    zoom_host_id = request.session['zoom_user'].get('id')
    json_data = json.loads(request.body)
    zoom_meeting_id = json_data.get('meeting_id')
    if not zoom_meeting_id or not zoom_host_id:
        return http.JsonResponse({"code": 400, "error": f'incorrect data'})

    zoom_auth = ZoomUserToken.objects.get(zoom_user_id=zoom_host_id)
    zoom_meeting = zoom_get(f'/meetings/{zoom_meeting_id}', zoom_auth)
    # TODO handle failure of this API call
    logger.error(zoom_meeting.json())

    # only create 1 Meeting for a given zoom meeting_id
    meeting, created = Meeting.objects.update_or_create(
        zoom_id=zoom_meeting_id, 
        defaults={
            "zoom_host_id": zoom_host_id,
            "zoom_data": json.dumps(zoom_meeting.json())}
        )
    if created:
        slug = "".join([random.choice(string.digits+string.ascii_letters) for i in range(16)])
        meeting.slug = slug
        meeting.save()

    # update the meeting via API to require registration
    if zoom_meeting.json().get('settings').get('approval_type') == 2: # no registration required
        data = {'settings': {'approval_type': 0}}
        meeting_data = zoom_patch(f'/meetings/{zoom_meeting_id}', zoom_auth, data)
        logger.error(meeting_data.content)
        # TODO check return

    # Create a registration for the Host
    registration, _ = Registration.objects.update_or_create(
        meeting=meeting,
        email=request.session['zoom_user'].get('email'),
        defaults={
            'name': f"🔱 {request.session['zoom_user'].get('first_name')}",
            'zoom_data': json.dumps({
                'zoom_registrant_id': zoom_host_id,
                'join_url': zoom_meeting.json().get('start_url'),
            }),
        }
    )
    request.session['user_registration'] = registration.email
    return http.JsonResponse({"code": "201", "url": f'/{meeting.slug}'})


def clear(request):
    del request.session['user_registration']
    return http.HttpResponseRedirect('/')


def register(request, slug):
    meeting = Meeting.objects.get(slug=slug)
    json_data = json.loads(request.body)
    # TODO check if a registration already exists for the user
    # call API to create registration
    user = ZoomUserToken.objects.get(zoom_user_id=meeting.zoom_host_id)
    data = {"email": json_data.get('email'), 'first_name': json_data.get('name')}
    resp = zoom_post(f'/meetings/{meeting.zoom_id}/registrants', user, data)
    logger.error(resp.json())
    registration, _ = Registration.objects.update_or_create(
        meeting=meeting, email=json_data.get('email'), 
        defaults={
            'registrant_id': resp.json().get('registrant_id'),
            'zoom_id': resp.json().get('id'),
            'name': json_data.get('name'),
            'zoom_data': json.dumps(resp.json()),
        }
    )
    request.session['user_registration'] = registration.email

    # Send message to room group
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'meeting_{meeting.slug}',
        {
            'type': 'meeting_message',
            'message': {'type': 'SET_REGISTRANTS', 'payload': list(map(serialize_registration, meeting.registration_set.all())) }
        }
    )

    return http.JsonResponse({'code': 201, 'registration': resp.json()})


def _ws_set_breakouts(meeting):
    # Send message to room group
    channel_layer = channels.layers.get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'meeting_{meeting.slug}',
        {
            'type': 'meeting_message',
            'message': {
                'type': 'SET_BREAKOUTS', 
                'payload': list(map(serialize_breakout, meeting.breakout_set.all()))
            }
        }
    )


@registration_required
def create_breakout(request, slug):
    meeting = Meeting.objects.get(slug=slug)
    data = json.loads(request.body)
    breakout = Breakout.objects.create(meeting=meeting, title=data.get('title'))
 
    _ws_set_breakouts(meeting)
    return http.JsonResponse({'code': 201, 'breakout': breakout.id})


@registration_required
def join_breakout(request, slug, breakout_id):
    meeting = Meeting.objects.get(slug=slug)
    breakout = Breakout.objects.get(pk=breakout_id)

    data = json.loads(request.body)
    email = request.session.get('user_registration')
    registration = meeting.registration_set.filter(email=email).first()
    registration.breakout = breakout
    registration.save()

    _ws_set_breakouts(meeting)
    return http.JsonResponse({'code': 201});


def unbreakout(request, slug):
    # TODO need to set CSRF cookie here?
    meeting = Meeting.objects.get(slug=slug)
    email = request.session.get('user_registration')
    if email and meeting.registration_set.filter(email=email).exists():
        user_registration = serialize_registration(meeting.registration_set.get(email=email))
    else:
        user_registration = None
    meeting_json = serialize_meeting(meeting)
    context = {
        'react_props': {
            "zoomUser": request.session.get('zoom_user'),
            'userRegistration': user_registration or None,
            'meeting': meeting_json
        }
    }
    return render(request, 'meetings/index.html', context)
