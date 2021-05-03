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
    re_path(r'^(?P<slug>\w+)/freeze$', views.freeze_breakouts, name='freeze_breakouts'),
    re_path(r'^(?P<slug>\w+)/clear$', views.clear_breakouts, name='clear_breakouts'),
    re_path(r'^(?P<slug>\w+)/manual_transfer$', views.manual_transfer, name='manual-transfer'),
    re_path(r'^(?P<slug>\w+)/create_zoom_meeting$', views.create_zoom_meeting, name='create_zoom_meeting'),
    re_path(r'^(?P<slug>\w+)/restore$', views.restore, name='restore'),

    re_path(r'^(?P<slug>\w+)/create_breakout$', views.create_breakout, name='create_breakout'),
    path('<slug:slug>/breakout/<int:breakout_id>/join', views.join_breakout, name='join_breakout'),
    path('<slug:slug>/breakout/unjoin', views.unjoin_breakout, name='unjoin_breakout'),
]
