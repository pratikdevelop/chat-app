import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Conversation, Message } from '../../interfaces';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})
export class ConversationComponent {
  @Input() conversation!: any;
  @Output() conversationSelected = new EventEmitter<any>();
  currentUserId = Number(localStorage.getItem('userId'));
  lastMessage: any | null = null;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.loadLastMessage();
  }

  loadLastMessage(): void {
    this.chatService.getMessages(this.conversation.id).subscribe({
      next: (response) => {
        this.lastMessage = response.messages[response.messages.length - 1] || null;
      },
    });
  }

  getProfileImage(): string | undefined {
    const otherMember = this.conversation.members.find((m: { id: number; }) => m.id !== this.currentUserId);
    return this.conversation.conversation_type === 'group' ? undefined :  `http://localhost:8000${otherMember?.profile_image}`;
  }

  getOtherMemberName(): string {
    const otherMember = this.conversation.members.find((m: { id: number; }) => m.id !== this.currentUserId);
    console.log(
      otherMember
    );
    
    return otherMember ? 'Unknown' : 'Unknown';
  }

  getLastMessage(): string {
    return this.lastMessage ? this.lastMessage.message || '[Media]' : 'No messages yet';
  }

  hasUnreadMessages(): boolean {
    return this.lastMessage ? !this.lastMessage.is_read && this.lastMessage.sender.id !== this.currentUserId : false;
  }
}