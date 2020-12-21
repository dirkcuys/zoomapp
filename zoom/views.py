from django.shortcuts import render
from django import http
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .models import ZoomUserToken
from .api import zoom_get, zoom_post
from .signals import zoom_webhook, ZoomApp

import requests
import logging
import json

logger = logging.getLogger(__name__)


def redirect(request):
    url = f'https://zoom.us/oauth/authorize?response_type=code&client_id={settings.ZOOM_CLIENT_ID}&redirect_uri={settings.ZOOM_REDIRECT_URL}'
    return http.HttpResponseRedirect(url)


def callback(request):
    code = request.GET.get('code')
    url = f'https://zoom.us/oauth/token?grant_type=authorization_code&code={code}&redirect_uri={settings.ZOOM_REDIRECT_URL}'
    auth = (settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET)
    resp = requests.post(url, auth=auth)
    access_token = resp.json().get('access_token')
    refresh_token = resp.json().get('refresh_token')
    logger.error(resp.json())
    # Move to zoom/api.py
    headers = {"Authorization": f'Bearer {access_token}'}
    api_resp = requests.get('https://api.zoom.us/v2/users/me', headers=headers)
    user_id = api_resp.json().get('id')
    user, created = ZoomUserToken.objects.update_or_create(zoom_user_id=user_id, defaults={
        'access_token': access_token,
        'refresh_token': refresh_token,
        'zoom_api_data': json.dumps(api_resp.json()),
    })
    request.session['zoom_user'] = api_resp.json()
    return http.HttpResponseRedirect('/list')


def _data_compliance(deauth_data):
    data = {
        "client_id": settings.ZOOM_CLIENT_ID,
        "user_id": deauth_data.get('user_id'),
        "account_id": deauth_data.get('account_id'),
        "deauthorization_event_received": deauth_data,
        "compliance_completed": True
    }
    compliance_url = 'https://api.zoom.us/oauth/data/compliance'
    headers = {
        "Content-Type": "application/json; charset=utf-8",
    }
    auth = (settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET)
    post_data = json.dumps(data, ensure_ascii=False).encode('utf-8')
    api_resp = requests.post(compliance_url, headers=headers, data=post_data, auth=auth)
    if api_resp.status_code != 200:
        raise Exception('data compliance API call failed')


@csrf_exempt
def deauth(request):
    data = json.loads(request.body)
    user_id = data.get('payload').get('user_id')
    data_retention = data.get('payload').get('user_data_retention')
    ZoomUserToken.objects.get(zoom_user_id=user_id).delete()
    if not data_retention:
        _data_compliance(data.get('payload'))
    return http.HttpResponse(status=200)


@csrf_exempt
def hook(request, path):
    logger.error(f'** hook: {path}')
    data = json.loads(request.body)
    logger.error(data)
    zoom_webhook.send(sender=ZoomApp, event=data.get('event'), payload=data.get('payload'))   
    return http.HttpResponse(status=200)


def meetings(request):
    user_id = request.session['zoom_user'].get('id')
    user = ZoomUserToken.objects.get(zoom_user_id=user_id)
    api_resp = zoom_get(f'/users/{user_id}/meetings?type=scheduled', user)
    return http.JsonResponse(api_resp.json())
