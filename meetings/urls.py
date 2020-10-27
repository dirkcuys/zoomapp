from django.urls import path, re_path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('create', views.create, name='create'),
    path('clear', views.clear, name='clear'),
    re_path(r'^(?P<slug>\w+)$', views.unbreakout, name='meeting'),
    re_path(r'^(?P<slug>\w+)/register$', views.register, name='register'),
    re_path(r'^(?P<slug>\w+)/create_breakout$', views.create_breakout, name='create_breakout'),
]
