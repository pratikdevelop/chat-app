from rest_framework import serializers
from .models import User, Conversation, Message, Expire, GroupInvitation, TypingIndicator, MessageReaction


# User Serializer
class UserSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True, max_length=160)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'password', 'profile_image', 'status', 'phone', 'bio',
            'last_seen', 'is_verified', 'notification_token'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'status': {'read_only': True},
            'last_seen': {'read_only': True},
            'is_verified': {'read_only': True},
            'notification_token': {'write_only': True},
        }

    def create(self, validated_data):
        """Handle user creation with first_name and last_name."""
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name', '')
        username = f"{first_name}{last_name}".replace(" ", "").lower()[:150]
        validated_data['username'] = username
        print(f"Creating user with: {validated_data}")  # Debug
        user = User.objects.create_user(**validated_data)
        print(f"User created: {user.email}, ID: {user.id}")  # Debug
        return user

    def update(self, instance, validated_data):
        first_name = validated_data.get('first_name', instance.first_name)
        last_name = validated_data.get('last_name', instance.last_name)
        if 'first_name' in validated_data or 'last_name' in validated_data:
            instance.username = f"{first_name}{last_name}".replace(" ", "").lower()[:150]
        return super().update(instance, validated_data)
# Conversation Serializer
class ConversationSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)
    group_admins = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'members', 'conversation_type', 'name', 'created_at', 'updated_at', 'group_admins', 'is_muted'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        """Ensure group chats have a name."""
        if data.get('conversation_type') == 'group' and not data.get('name'):
            raise serializers.ValidationError({"name": "Group conversations must have a name."})
        return data


# Message Serializer
class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    file = serializers.FileField(required=False, allow_null=True)
    read_by = UserSerializer(many=True, read_only=True)
    parent_message = serializers.PrimaryKeyRelatedField(
        queryset=Message.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'message', 'file', 'message_type', 'created_at',
            'is_read', 'read_by', 'is_delivered', 'parent_message'
        ]
        read_only_fields = ['sender','created_at', 'is_read', 'read_by', 'is_delivered']

    def create(self, validated_data):
        """Set message_type based on content."""
        if 'file' in validated_data and validated_data['file']:
            validated_data['message_type'] = validated_data.get('message_type', 'file')
        elif not validated_data.get('message'):
            raise serializers.ValidationError({"message": "Message content or file is required."})
        return super().create(validated_data)


class ExpireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expire
        fields = ['id', 'user', 'otp', 'created_at', 'expires_at']
        read_only_fields = ['created_at', 'expires_at']


# Group Invitation Serializer
class GroupInvitationSerializer(serializers.ModelSerializer):
    invited_by = UserSerializer(read_only=True)
    invited_user = UserSerializer(read_only=True)
    conversation = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all())

    class Meta:
        model = GroupInvitation
        fields = ['id', 'conversation', 'invited_by', 'invited_user', 'invite_code', 'created_at', 'expires_at', 'is_accepted']
        read_only_fields = ['invite_code', 'created_at', 'expires_at']


# Typing Indicator Serializer
class TypingIndicatorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    conversation = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all())

    class Meta:
        model = TypingIndicator
        fields = ['id', 'user', 'conversation', 'last_typed']
        read_only_fields = ['last_typed']


# Message Reaction Serializer
class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    message = serializers.PrimaryKeyRelatedField(queryset=Message.objects.all())

    class Meta:
        model = MessageReaction
        fields = ['id', 'message', 'user', 'reaction', 'created_at']
        read_only_fields = ['created_at']