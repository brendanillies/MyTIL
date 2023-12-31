from django.urls import path

from . import views

app_name = 'profiles'

urlpatterns = [
    path('<str:username>/', views.ProfileDetailView.as_view(), name='detail'),
    path('account/<str:username>/', views.ProfileSettingsView.as_view(), name='account'),
    path('<str:username>/follow', views.FollowView.as_view(), name='follow'),
    path('', views.SearchView.as_view(), name='search'),
]
