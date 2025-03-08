from django.urls import path
from django.conf import settings
from django.conf.urls.static import static  # Import for serving media files
from rest_framework_simplejwt.views import TokenRefreshView
from chat import views
from django.contrib import admin

urlpatterns = [
    path('admin/', admin.site.urls),  # Added trailing slash for consistency
    path('api/signup/', views.SignupView.as_view(), name='signup'),  # Added trailing slashes
    path('api/signin/', views.LoginView.as_view(), name='login'),   # Changed to 'signin' as per your log
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/update-profile/', views.UpdateProfileView.as_view(), name='update_profile'),
    path('api/change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('api/forget-password/', views.ForgetPasswordView.as_view(), name='forget_password'),
    path('api/verify-otp/', views.VerifyOtpView.as_view(), name='verify_otp'),
    path('api/users/<int:user_id>/', views.GetUserByIdView.as_view(), name='get_user_by_id'),
    path('api/users/', views.GetUsersView.as_view(), name='get_users'),
    path('api/conversations/create/', views.CreateConversationView.as_view(), name='create_conversation'),
    path('api/conversations/', views.GetConversationsView.as_view(), name='get_conversations'),
    path('api/messages/post/', views.PostMessageView.as_view(), name='post_message'),
    path('api/messages/<int:conversation_id>/', views.GetMessagesView.as_view(), name='get_messages'),
    path('api/group-invite/create/', views.CreateGroupInvitationView.as_view(), name='create_group_invite'),
    path('api/group-invite/join/', views.JoinGroupView.as_view(), name='join_group'),
    path('api/typing/', views.TypingIndicatorView.as_view(), name='typing_indicator'),
    path('api/typing/<int:conversation_id>/', views.GetTypingIndicatorsView.as_view(), name='get_typing_indicators'),
    path('api/message-reaction/', views.MessageReactionView.as_view(), name='message_reaction'),
]

# Serve media files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)