from django.core.exceptions import PermissionDenied
from .models import Meeting

def registration_required(func):
    def decorated(*args, **kwargs):
        meeting = Meeting.objects.get(slug=kwargs['slug'])
        # Get meeting
        if args[0].session.get('user_registration') or args[0].session.get('zoom_user'):
            return func(*args, **kwargs)
        raise PermissionDenied
    return decorated


def host_required(func):
    def decorated(*args, **kwargs):
        if not args[0].session.get('zoom_user'):
            raise PermissionDenied
        return func(*args, **kwargs)
    return decorated

