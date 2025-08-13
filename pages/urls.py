from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('wheel', views.wheel, name='wheel'),
    path('wheel/recalculate_chart/', views.recalculate_chart, name='recalculate_chart'),
]

