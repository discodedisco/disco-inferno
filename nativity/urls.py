from django.urls import path
from . import views

urlpatterns = [
    path('api/elemental', views.elemental_data, name='elemental_data'),
]
