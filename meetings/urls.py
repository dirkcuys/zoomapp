from django.urls import path, re_path

from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('list', views.list_meetings, name='list'),
    re_path(r'^m/(?P<slug>\w+)$', views.unbreakout, name='meeting'),

    path('create', views.create, name='create'),
    path('clear', views.clear, name='clear'),
    re_path(r'^(?P<slug>\w+)/register$', views.register, name='register'),
    re_path(r'^(?P<slug>\w+)/export$', views.export_breakouts, name='export'),
    re_path(r'^(?P<slug>\w+)/create_breakout$', views.create_breakout, name='create_breakout'),
    path('<slug:slug>/breakout/<int:breakout_id>/join', views.join_breakout, name='join_breakout'),

    re_path(r'^(?P<short_code>\w+)$', views.registration, name='registration'),
]
