from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

import users.views
import music.views

urlpatterns = [
	path('api/register/', users.views.register_user, name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/logout/', users.views.logout_user, name='logout'),

    path('api/all_users', users.views.get_all_users, name='all_users'),
    path('api/user_info/<int:user_id>', users.views.get_user_info, name='user_info'),

    path('api/update_friend/', users.views.update_friend, name='update_friend'),

    path('upload_test/', music.views.upload_test, name='upload_test'),
    path('api/post_song/', music.views.post_song, name='post_song'),
    path('api/post_song_comment/', music.views.post_song_comment, name='post_song_comment'),
    path('api/song_info/<int:song_id>', music.views.get_song_info, name='get_song_info'),
    path('api/song_comment/<int:comment_id>', music.views.get_song_comment, name='get_song_comment'),

    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/health/', users.views.health_check, name='health_check')
]
