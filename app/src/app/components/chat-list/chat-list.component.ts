import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Conversation, Message } from '../../interfaces';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, FormsModule],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnChanges {
  @Input() conversation!: Conversation;
  @Input() messages: Message[] = [];
  @Output() messageSent = new EventEmitter<any>();
  @Output() typing = new EventEmitter<boolean>();
  newMessage: string = '';
  selectedFile: File | null = null;
  typingUsers: any[] = []; // Placeholder for typing indicators
  currentUserId = Number(localStorage.getItem('userId'));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['conversation'] && this.conversation) {
      // Placeholder for real-time typing indicators
    }
  }

  isOwnMessage(message: Message): boolean {
    return message.sender.id === this.currentUserId;
  }

  getOtherMemberName(): string {
    const otherMember = this.conversation.members.find(m => m.id !== this.currentUserId);
    return otherMember ? `${otherMember.first_name} ${otherMember.last_name}` : 'Unknown';
  }

  getOtherMemberProfileImage(): string | undefined {
    const otherMember = this.conversation.members.find(m => m.id !== this.currentUserId);
    return otherMember?.profile_image ? `http://localhost:8000${otherMember.profile_image}` : undefined;
  }

  getOtherMemberStatus(): string {
    const otherMember = this.conversation.members.find(m => m.id !== this.currentUserId);
    return otherMember?.status === 'online' ? 'Online' : 'Offline';
  }

  getUser(typingUsers: any[]): string {
    return typingUsers.map(u => u.user.first_name).join(', ');
  }

  onTyping(): void {
    this.typing.emit(true);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  sendMessage(): void {
    if (this.newMessage.trim() || this.selectedFile) {
      const messageData = {
        conversation: this.conversation.id,
        message: this.newMessage,
        file: this.selectedFile,
      };
      console.log('Sending message data:', messageData); // Debug
      this.messageSent.emit(messageData);
      this.newMessage = '';
      this.selectedFile = null;
      this.typing.emit(false);
    }
  }
}