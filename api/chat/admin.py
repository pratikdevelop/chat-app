from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Conversation, Message, Expire, GroupInvitation, TypingIndicator, MessageReaction
)


# Custom User Admin
class UserAdmin(BaseUserAdmin):
    # Fields to display in the list view
    list_display = ('email', 'first_name', 'last_name', 'status', 'last_seen', 'is_verified', 'is_staff')
    list_filter = ('status', 'is_verified', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    
    # Fields in the edit form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'bio', 'profile_image')}),
        ('Status', {'fields': ('status', 'last_seen', 'is_verified', 'notification_token')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Blocked Users', {'fields': ('blocked_users',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'phone', 'bio', 'profile_image'),
        }),
    )
    
    # Override to use email instead of username
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions', 'blocked_users')


# Inline for Messages in Conversation
class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ('sender', 'message', 'file', 'message_type', 'created_at', 'is_read', 'is_delivered')
    readonly_fields = ('created_at',)


# Conversation Admin
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation_type', 'name', 'created_at', 'updated_at', 'member_count')
    list_filter = ('conversation_type', 'created_at')
    search_fields = ('name',)
    filter_horizontal = ('members', 'group_admins')
    inlines = [MessageInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = 'Members'


# Inline for Reactions in Message
class MessageReactionInline(admin.TabularInline):
    model = MessageReaction
    extra = 0
    fields = ('user', 'reaction', 'created_at')
    readonly_fields = ('created_at',)


# Message Admin
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'message_type', 'created_at', 'is_read', 'is_delivered')
    list_filter = ('message_type', 'is_read', 'is_delivered', 'created_at')
    search_fields = ('message', 'sender__email', 'sender__first_name', 'sender__last_name')
    filter_horizontal = ('read_by',)
    inlines = [MessageReactionInline]


# Expire Admin
class ExpireAdmin(admin.ModelAdmin):
    list_display = ('user', 'otp', 'created_at', 'expires_at', 'is_expired')
    list_filter = ('created_at', 'expires_at')
    search_fields = ('user__email', 'otp')

    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'


# Group Invitation Admin
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'invited_by', 'invited_user', 'invite_code', 'created_at', 'expires_at', 'is_accepted')
    list_filter = ('is_accepted', 'created_at', 'expires_at')
    search_fields = ('invite_code', 'conversation__name', 'invited_by__email', 'invited_user__email')


# Typing Indicator Admin
class TypingIndicatorAdmin(admin.ModelAdmin):
    list_display = ('user', 'conversation', 'last_typed')
    list_filter = ('last_typed',)
    search_fields = ('user__email', 'conversation__name')


# Message Reaction Admin
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ('message', 'user', 'reaction', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'message__message', 'reaction')


# Register Models with Admin
admin.site.register(User, UserAdmin)
admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Expire, ExpireAdmin)
admin.site.register(GroupInvitation, GroupInvitationAdmin)
admin.site.register(TypingIndicator, TypingIndicatorAdmin)
admin.site.register(MessageReaction, MessageReactionAdmin)