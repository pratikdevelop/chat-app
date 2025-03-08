import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css'],
})
export class ChatWindowComponent implements OnChanges {
  @Input() selectedChat: any;
  messages: any[] = [];
  newMessage = '';
  loading = false;

  constructor(private chatService: ChatService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedChat'] && this.selectedChat) {
      this.loadMessages();
    }
  }

  loadMessages() {
    this.loading = true;
    this.chatService.getMessages(this.selectedChat.id).subscribe(
      (msgs) => {
        this.messages = msgs;
        this.loading = false;
      },
      () => (this.loading = false)
    );
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message = {
      text: this.newMessage,
      isMine: true,
      timestamp: new Date(),
    };

    this.messages.push(message);
    this.newMessage = '';

    // Simulating sending the message
    // this.chatService.sendMessage(this.selectedChat.id, message).subscribe();
  }
}
