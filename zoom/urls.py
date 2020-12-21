from django.urls import path, re_path

from . import views

urlpatterns = [
    path('redirect', views.redirect, name='redirect'),
    path('callback', views.callback, name='callback'),
    path('deauth', views.callback, name='deauth'),
    path('meetings', views.meetings, name='meetings'),
    re_path(r'(?P<path>.*)/$', views.hook, name='hook'),
]
