from django.urls import path, re_path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('create', views.create, name='create'),
    re_path(r'^(?P<slug>\w+)$', views.unbreakout, name='meeting'),
    re_path(r'^(?P<slug>\w+)/register$', views.register, name='register'),
]
