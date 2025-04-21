# I M P O R T S   &   D E P E N D E N C I E S ----------------------
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
import users.views
import feed.views

# U R L S ----------------------------------------------------------

urlpatterns = [
    # User URLs
	path('api/register/', users.views.register_user, name='register'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/logout/', users.views.logout_user, name='logout'),
    path('api/all_users', users.views.get_all_users, name='all_users'),
    path('api/user_info/<int:user_id>', users.views.get_user_info, name='user_info'),
    path('api/update_friend/', users.views.update_friend, name='update_friend'),

    # JWT Refresh URLs
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Testing URLs
    path('api/health/', users.views.health_check, name='health_check'),

    # Feed App URLs
    # <int:pk> is Djangos build-in identifier (ID) for each entry in a DataBase!
    path('upload_test/', feed.views.upload_test, name='upload_test'),
    path('api/posts/', feed.views.post_list, name='post-list'),
    path('api/posts/<int:pk>/', feed.views.post_detail, name='post-detail'),
    path('api/posts/<int:pk>/like/', feed.views.like_post, name='like-post'),
    path('api/posts/<int:post_id>/comments/', feed.views.post_comments, name='post-comments'),
    path('api/posts/<int:pk>/image/', feed.views.get_image, name='post-get-image'),
    path('api/posts/<int:pk>/song/', feed.views.get_song, name='post-get-song'),
    path('api/friend-requests/', users.views.get_friend_requests, name='friend-requests'),
    path('api/friends/', users.views.get_friends, name='friends'),
]
