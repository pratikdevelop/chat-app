from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import datetime, timedelta
import random
import string
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Conversation, Message, Expire, GroupInvitation, TypingIndicator, MessageReaction
from .serializers import (
    UserSerializer, ConversationSerializer, MessageSerializer, ExpireSerializer,
    GroupInvitationSerializer, TypingIndicatorSerializer, MessageReactionSerializer
)


# User Signup
class SignupView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        print("Request data:", request.data)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            if 'password' not in request.data:
                return Response({"error": "Password field is required"}, status=status.HTTP_400_BAD_REQUEST)
            user = serializer.save()  # No pre-hashing here
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response({
                'status': True,
                'message': 'Signup successful',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# User Login
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("Login request data:", request.data)  # Debug incoming data
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = authenticate(request, email=email, password=password)
        if user is not None:
            user.update_last_seen()  # Update last_seen on login
            refresh = RefreshToken.for_user(user)
            tokens = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return Response({
                'status': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        return Response(
            {"error": "Invalid email or password"},
            status=status.HTTP_401_UNAUTHORIZED
        )


# Update Profile
class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'data': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Change Password
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        if not password or not confirm_password:
            return Response({'error': 'Both password and confirm_password required'}, status=status.HTTP_400_BAD_REQUEST)
        if password != confirm_password:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)


# Forget Password
class ForgetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            otp = str(random.randint(100000, 999999))
            expires_at = datetime.now() + timedelta(minutes=10)
            Expire.objects.create(user=user, otp=otp, expires_at=expires_at)
            send_mail(
                'Password Reset OTP',
                f'Your OTP is {otp}, valid for 10 minutes.',
                'from@example.com',  # Replace with your email
                [email],
                fail_silently=False,
            )
            return Response({'message': 'OTP sent'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)


# Verify OTP
class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        try:
            user = User.objects.get(email=email)
            expire = Expire.objects.filter(user=user, otp=otp, expires_at__gt=datetime.now()).first()
            if expire:
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# Get User by ID
class GetUserByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        print("Request:", request.user, "User ID:", user_id)  # Debug request and user
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found', 'code': 'user_not_found'},
                status=status.HTTP_404_NOT_FOUND
            )


# Get All Users
class GetUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.exclude(id=request.user.id)  # Exclude the current user
        serializer = UserSerializer(users, many=True)
        return Response({'users': serializer.data}, status=status.HTTP_200_OK)


# Create Conversation
# chat/views.py
class CreateConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        receiver_id = request.data.get('receiver_id')
        conversation_type = request.data.get('conversation_type', 'private')
        name = request.data.get('name')

        if conversation_type == 'private' and not receiver_id:
            return Response({'error': 'Receiver ID required for private chats'}, status=status.HTTP_400_BAD_REQUEST)
        if conversation_type == 'group' and not name:
            return Response({'error': 'Group name required for group chats'}, status=status.HTTP_400_BAD_REQUEST)
        if receiver_id and sender.id == int(receiver_id):
            return Response({'error': 'Cannot create conversation with yourself'}, status=status.HTTP_400_BAD_REQUEST)

        if conversation_type == 'private':
            try:
                receiver = User.objects.get(id=receiver_id)
            except User.DoesNotExist:
                return Response({'error': 'Receiver not found'}, status=status.HTTP_404_NOT_FOUND)
            conversation = Conversation.objects.filter(
                conversation_type='private', members=sender
            ).filter(members=receiver_id).first()
            if conversation:
                return Response({'data': ConversationSerializer(conversation).data}, status=status.HTTP_200_OK)
            conversation = Conversation.objects.create(conversation_type='private')
            conversation.members.add(sender, receiver)
        else:  # Group chat
            conversation = Conversation.objects.create(conversation_type='group', name=name)
            conversation.members.add(sender)
            conversation.group_admins.add(sender)
            if receiver_id:  # Add initial members if provided
                try:
                    receiver = User.objects.get(id=receiver_id)
                    conversation.members.add(receiver)
                except User.DoesNotExist:
                    pass

        return Response({'data': ConversationSerializer(conversation).data}, status=status.HTTP_201_CREATED)
# Get Conversations
class GetConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.id
        conversations = Conversation.objects.filter(members=user_id)
        serializer = ConversationSerializer(conversations, many=True)
        return Response({'conversations': serializer.data}, status=status.HTTP_200_OK)

# chat/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Conversation, Message, User
from .serializers import MessageSerializer

class PostMessageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # Accept JSON and multipart

    def post(self, request):
        print("Request data:", request.data)  # Debug
        conversation_id = request.data.get('conversation')
        message_text = request.data.get('message', '')
        file = request.data.get('file', None)

        # Validate conversation
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if request.user not in conversation.members.all():
                return Response(
                    {'error': 'You are not a member of this conversation'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Conversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Determine message type
        message_type = 'media' if file else 'text'
        if not message_text and not file:
            return Response(
                {'error': 'Message or file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create message
        message_data = {
            'conversation': conversation,
            'sender': request.user,
            'message': message_text,
            'file': file,
            'message_type': message_type,
            'is_delivered': True,  # Delivered to all members initially
            'is_read': False,      # Updated when viewed
        }
        
        message = Message.objects.create(**message_data)
        
        # Serialize and return response
        serializer = MessageSerializer(message)
        return Response(
            {'data': serializer.data},
            status=status.HTTP_201_CREATED
        )

# Get Messages
class GetMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if request.user not in conversation.members.all():
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            messages = Message.objects.filter(conversation=conversation).order_by('created_at')
            serializer = MessageSerializer(messages, many=True)
            # Mark messages as delivered for the current user
            for message in messages.filter(is_delivered=False).exclude(sender=request.user):
                message.is_delivered = True
                message.save()
            return Response({'messages': serializer.data}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


# Create Group Invitation
class CreateGroupInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get('conversation_id')
        invited_user_id = request.data.get('invited_user_id')
        try:
            conversation = Conversation.objects.get(id=conversation_id, conversation_type='group')
            if request.user not in conversation.group_admins.all():
                return Response({'error': 'Only group admins can invite'}, status=status.HTTP_403_FORBIDDEN)
            invited_user = User.objects.get(id=invited_user_id)
            if invited_user in conversation.members.all():
                return Response({'error': 'User already in group'}, status=status.HTTP_400_BAD_REQUEST)
            invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            invitation = GroupInvitation.objects.create(
                conversation=conversation,
                invited_by=request.user,
                invited_user=invited_user,
                invite_code=invite_code
            )
            return Response({'data': GroupInvitationSerializer(invitation).data}, status=status.HTTP_201_CREATED)
        except Conversation.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response({'error': 'Invited user not found'}, status=status.HTTP_404_NOT_FOUND)


# Join Group via Invitation
class JoinGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invite_code = request.data.get('invite_code')
        try:
            invitation = GroupInvitation.objects.get(
                invite_code=invite_code, expires_at__gt=timezone.now(), is_accepted=False
            )
            if invitation.invited_user != request.user:
                return Response({'error': 'Invitation not for this user'}, status=status.HTTP_403_FORBIDDEN)
            invitation.conversation.members.add(request.user)
            invitation.is_accepted = True
            invitation.save()
            return Response({'data': ConversationSerializer(invitation.conversation).data}, status=status.HTTP_200_OK)
        except GroupInvitation.DoesNotExist:
            return Response({'error': 'Invalid or expired invitation'}, status=status.HTTP_404_NOT_FOUND)


# Typing Indicator
class TypingIndicatorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        conversation_id = request.data.get('conversation_id')
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if request.user not in conversation.members.all():
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            TypingIndicator.objects.update_or_create(
                user=request.user,
                conversation=conversation,
                defaults={'last_typed': timezone.now()}
            )
            return Response({'message': 'Typing indicator updated'}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


# Get Typing Indicators
class GetTypingIndicatorsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if request.user not in conversation.members.all():
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            # Show users typing in the last 5 seconds
            recent_time = timezone.now() - timedelta(seconds=5)
            indicators = TypingIndicator.objects.filter(
                conversation=conversation, last_typed__gte=recent_time
            ).exclude(user=request.user)
            serializer = TypingIndicatorSerializer(indicators, many=True)
            return Response({'typing_users': serializer.data}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


# Add Message Reaction
class MessageReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message_id = request.data.get('message_id')
        reaction = request.data.get('reaction')
        if not reaction or len(reaction) > 20:
            return Response({'error': 'Valid reaction required (max 20 chars)'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            message = Message.objects.get(id=message_id)
            if request.user not in message.conversation.members.all():
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
            reaction_obj, created = MessageReaction.objects.update_or_create(
                message=message, user=request.user, defaults={'reaction': reaction}
            )
            return Response({'data': MessageReactionSerializer(reaction_obj).data}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)