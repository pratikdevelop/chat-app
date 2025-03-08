import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { UserService } from '../../services/user.service';
import { HeaderComponent } from '../header/header.component';
import { ConversationComponent } from '../conversation/conversation.component';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { UsersComponent } from '../users/users.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    HeaderComponent,
    ConversationComponent,
    ChatListComponent,
    // UsersComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('groupChatDialog') groupChatDialog: any;
  leftOpen = true;
  rightOpen = false;
  conversations: any[] = [];
  messages: any[] = [];
  users: any[] = [];
  selectedConversation: any | null = null;
  groupName: string = '';
  selectedMembers: number[] = [];

  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadConversations();
    this.loadUsers();
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'new-chat') {
        this.rightOpen = true; // Open users sidebar for selection
      } else if (params['action'] === 'new-group') {
        this.openGroupChatDialog();
      }
    });
  }

  loadConversations(): void {
    this.chatService.getConversations().subscribe({
      next: (response) => this.conversations = response.conversations,
      error: (error) => console.error('Error loading conversations:', error),
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => this.users = response.users,
      error: (error) => console.error('Error loading users:', error),
    });
  }

  selectConversation(conversation: any): void {
    this.selectedConversation = conversation;
    this.chatService.getMessages(conversation.id).subscribe({
      next: (response) => this.messages = response.messages,
      error: (error) => console.error('Error loading messages:', error),
    });
  }

  sendMessage(messageData: any): void {
    const data = { ...messageData, conversation: this.selectedConversation?.id };
    this.chatService.sendMessage(data).subscribe({
      next: (response) => this.messages.push(response.data),
      error: (error) => console.error('Error sending message:', error),
    });
  }

  updateTyping(event: boolean): void {
    if (this.selectedConversation && event) {
      this.chatService.updateTyping(this.selectedConversation.id).subscribe();
    }
  }

  startPrivateChat(user: any): void {
    this.chatService.createConversation({ receiver_id: user.id }).subscribe({
      next: (response) => {
        const newConversation = response.data;
        this.conversations.push(newConversation);
        this.selectConversation(newConversation);
        this.rightOpen = false; // Close users sidebar
      },
      error: (error) => console.error('Error starting conversation:', error),
    });
  }

  openGroupChatDialog(): void {
    this.dialog.open(this.groupChatDialog, { width: '400px' });
  }

  closeDialog(): void {
    this.dialog.closeAll();
    this.groupName = '';
    this.selectedMembers = [];
  }

  createGroupChat(): void {
    if (this.groupName) {
      const data = {
        conversation_type: 'group',
        name: this.groupName,
        receiver_id: this.selectedMembers.length ? this.selectedMembers[0] : undefined, // Add first member
      };
      this.chatService.createConversation(data).subscribe({
        next: (response) => {
          const newConversation = response.data;
          this.conversations.push(newConversation);
          this.selectConversation(newConversation);
          this.closeDialog();
          // Add remaining members if any
          if (this.selectedMembers.length > 1) {
            this.addMembersToGroup(newConversation.id, this.selectedMembers.slice(1));
          }
        },
        error: (error) => console.error('Error creating group chat:', error),
      });
    }
  }

  addMembersToGroup(conversationId: any, memberIds: number[]): void {
    memberIds.forEach(id => {
      this.chatService.createConversation({ receiver_id: id, conversation_id: conversationId }).subscribe();
    });
  }

  toggleLeftSidebar(): void {
    this.leftOpen = !this.leftOpen;
  }

  toggleRightSidebar(): void {
    this.rightOpen = !this.rightOpen;
  }
}