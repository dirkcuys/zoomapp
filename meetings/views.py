from django.shortcuts import render
from django import http

from .models import Meeting
from zoom.api import zoom_post, zoom_get, zoom_patch
from zoom.models import ZoomUser

import json
import logging

logger = logging.getLogger(__name__)


def index(request):
    context = {}
    context['react_props'] = {"zoomUser": request.session.get('zoom_user')}
    return render(request, 'meetings/index.html', context)


def create(request):
    # TODO ensure the person calling this view is the host and owns the meeting!
    json_data = json.loads(request.body)
    zoom_meeting_id = json_data.get('meeting_id')
    zoom_host_id = request.session['zoom_user'].get('id')
    if not zoom_meeting_id or not zoom_host_id:
        return http.JsonResponse({"code": 400, "error": f'incorrect data'})
    import string, random
    slug = "".join([random.choice(string.digits+string.ascii_letters) for i in range(16)])
    Meeting.objects.create(zoom_id=zoom_meeting_id, zoom_host_id=zoom_host_id, slug=slug)

    # update the meeting via API to require registration
    zoom_user = ZoomUser.objects.get(zoom_user_id=zoom_host_id)
    meeting = zoom_get(f'/meetings/{zoom_meeting_id}', zoom_user)
    logger.error(meeting.json())
    if meeting.json().get('settings').get('approval_type') == 2: # no registration required
        data = {'settings': {'approval_type': 0}}
        meeting_data = zoom_patch(f'/meetings/{zoom_meeting_id}', zoom_user, data)
        logger.error(meeting_data.content)
        # TODO check return
    return http.JsonResponse({"code": "201", "url": f'/{slug}'})


def register(request, slug):
    meeting = Meeting.objects.get(slug=slug)
    json_data = json.loads(request.body)
    # call API to create registration
    user = ZoomUser.objects.get(zoom_user_id=meeting.zoom_host_id)
    data = {"email": json_data.get('email'), 'first_name': json_data.get('name')}
    resp = zoom_post(f'/meetings/{meeting.zoom_id}/registrants', user, data)
    logger.error(resp.json())
    request.session['user_registration'] = resp.json()
    return http.JsonResponse({'code': 201, 'registration': resp.json()})


def _serialize_breakout(breakout):
    return {'title': breakout.title, 'size': breakout.size, 'participants': []}


def _serialize_meeting(meeting):
    meeting_json = {
        'zoom_id': meeting.zoom_id,
        'slug': meeting.slug,
        'breakouts': list(map(_serialize_breakout, meeting.breakout_set.all())),
    }
    return meeting_json


def unbreakout(request, slug):
    meeting = Meeting.objects.get(slug=slug)
    meeting_json = _serialize_meeting(meeting)
    context = {
        'react_props': {
            "zoomUser": request.session.get('zoom_user'),
            'userRegistration': request.session.get('user_registration'),
            'meeting': meeting_json
        }
    }
    return render(request, 'meetings/index.html', context)
