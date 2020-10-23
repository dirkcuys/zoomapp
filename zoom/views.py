from django.shortcuts import render
from django import http
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

from .models import ZoomUser
from .api import zoom_get, zoom_post

import requests
import logging

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
    user, created = ZoomUser.objects.update_or_create(zoom_user_id=user_id, defaults={
        'access_token': access_token,
        'refresh_token': refresh_token,
    })
    request.session['zoom_user'] = api_resp.json()
    return http.HttpResponseRedirect('/')


@csrf_exempt
def hook(request, path):
    logger.error(f'** hook: {path}')
    logger.error(request.body)
    return http.HttpResponse(status=200)


def meetings(request):
    user_id = request.session['zoom_user'].get('id')
    user = ZoomUser.objects.get(zoom_user_id=user_id)
    api_resp = zoom_get(f'/users/{user_id}/meetings?type=scheduled', user)
    return http.JsonResponse(api_resp.json())
