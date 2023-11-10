from django.urls import path

from . import views

app_name = 'profiles'

urlpatterns = [
    path('<str:username>/', views.ProfileDetailView.as_view(), name='detail'),
    path('settings/<str:username>/', views.ProfileSettingsView.as_view(), name='settings'),
    path('<str:username>/follow', views.FollowView.as_view(), name='follow'),
]
