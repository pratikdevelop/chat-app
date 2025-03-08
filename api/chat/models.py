from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


# Custom User Model
class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=[('online', 'Online'), ('offline', 'Offline'), ('away', 'Away'), ('busy', 'Busy')],
        default='offline'
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    bio = models.TextField(max_length=160, blank=True, null=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    notification_token = models.CharField(max_length=255, blank=True, null=True)
    blocked_users = models.ManyToManyField('self', symmetrical=False, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        related_name='chat_user_set',
        related_query_name='chat_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        related_name='chat_user_set',
        related_query_name='chat_user',
    )

    def __str__(self):
        return self.email

    def update_last_seen(self):
        self.last_seen = timezone.now()
        self.save(update_fields=['last_seen'])


# Conversation Model
class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ('private', 'Private'),
        ('group', 'Group'),
    )
    members = models.ManyToManyField(User, related_name='conversations')
    conversation_type = models.CharField(max_length=7, choices=CONVERSATION_TYPES, default='private')
    name = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    group_admins = models.ManyToManyField(User, related_name='admin_conversations', blank=True)
    is_muted = models.BooleanField(default=False)

    def __str__(self):
        if self.conversation_type == 'group' and self.name:
            return f"Group: {self.name} ({self.id})"
        return f"Conversation {self.id}"



# Message Model
class Message(models.Model):
    MESSAGE_TYPES = (
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('file', 'File'),
        ('system', 'System'),
    )
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    message = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to='messages/%Y/%m/%d/', null=True, blank=True)
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_by = models.ManyToManyField(User, blank=True, related_name='read_messages')
    is_delivered = models.BooleanField(default=False)
    parent_message = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.SET_NULL, related_name='replies'
    )

    def __str__(self):
        return f"{self.message_type} by {self.sender} in {self.conversation.id}"


# OTP Expiration Model
class Expire(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f"OTP {self.otp} for {self.user.email}"


# Group Invitation Model
class GroupInvitation(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='invitations')
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_invitations')
    invited_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_invitations')
    invite_code = models.CharField(max_length=10, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=timezone.now() + timedelta(days=7))
    is_accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Invite to {self.conversation} for {self.invited_user}"


# Typing Indicator Model
class TypingIndicator(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    last_typed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'conversation')

    def __str__(self):
        return f"{self.user} typing in {self.conversation}"


# Message Reaction Model
class MessageReaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reaction = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('message', 'user')

    def __str__(self):
        return f"{self.user} reacted {self.reaction} to {self.message}"