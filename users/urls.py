from django.urls import path
from . import views

urlpatterns = [
    path('', views.testpage, name='testpage'),
    path('users/', views.users, name='users'),
    path('users/details/<int:id>', views.details, name='details'),
]
