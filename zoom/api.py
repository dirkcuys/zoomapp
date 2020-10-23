from django.conf import settings

import requests
import json
import logging

logger = logging.getLogger(__name__)

_API_URL = 'https://api.zoom.us/v2'

def _refresh_token(user):
    refresh_token = user.refresh_token
    url = f'https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token={refresh_token}'
    logger.error(url)
    auth = (settings.ZOOM_CLIENT_ID, settings.ZOOM_CLIENT_SECRET)
    resp = requests.post(url, auth=auth)
    if resp.status_code != 200:
        logger.error(resp.json())
        user.access_token = ''
        user.refresh_token = ''
        user.save()
        return
    user.access_token = resp.json().get('access_token')
    user.refresh_token = resp.json().get('refresh_token')
    user.save()


def zoom_get(url, user):
    headers = {"Authorization": f'Bearer {user.access_token}'}
    api_resp = requests.get(_API_URL + url, headers=headers)
    if api_resp.json().get('code') == 124:
        _refresh_token(user)
        headers = {"Authorization": f'Bearer {user.access_token}'}
        api_resp = requests.get(_API_URL + url, headers=headers)
    return api_resp


def zoom_post(url, user, data, retries=1):
    headers = {
        "Authorization": f'Bearer {user.access_token}',
        "Content-Type": "application/json",
    }
    api_resp = requests.post(_API_URL + url, headers=headers, data=json.dumps(data))
    logger.error(api_resp.content)
    if api_resp.json().get('code') == 124 and retries > 0:
        _refresh_token(user)
        return zoom_post(url, user, data, retries-1)
    return api_resp


def zoom_patch(url, user, data, retries=1):
    headers = {
        "Authorization": f'Bearer {user.access_token}',
        "Content-Type": "application/json",
    }
    api_resp = requests.patch(_API_URL + url, headers=headers, data=json.dumps(data))
    logger.error(api_resp.content)
    if api_resp.json().get('code') == 124 and retries > 0:
        _refresh_token(user)
        return zoom_post(url, user, data, retries-1)
    return api_resp

