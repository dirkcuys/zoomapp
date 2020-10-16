from django.shortcuts import render
from django import http
from django.conf import settings

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
    # TODO store in session
    headers = {"Authorization": f'Bearer {access_token}'}
    api_resp = requests.get('https://api.zoom.us/v2/users/me', headers=headers)
    return http.HttpResponse(api_resp)


def hook(request, path):
    logger.error(f'** hook: {path}')
    logger.error(request.body)
    return http.HttpResponse(status=200)


