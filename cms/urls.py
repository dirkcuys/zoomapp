from django.urls import path, re_path

from . import views

urlpatterns = [
    path('terms', views.page, {'key': 'terms'}, name='terms'),
    path('privacy', views.page, {'key': 'privacy'}, name='privacy'),
    path('docs', views.page, name='docs'),
    re_path(r'^content/(?P<key>\w+)$', views.page, name='content'),
]

