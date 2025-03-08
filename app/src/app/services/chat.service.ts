import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, Message } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private baseUrl = 'http://localhost:8000/api/';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem('access_token')}` };
  }

  getConversations(): Observable<{ conversations: Conversation[] }> {
    return this.http.get<{ conversations: Conversation[] }>(`${this.baseUrl}conversations/`, {
      headers: this.getAuthHeaders(),
    });
  }

  getMessages(conversationId: number): Observable<{ messages: Message[] }> {
    return this.http.get<{ messages: Message[] }>(`${this.baseUrl}messages/${conversationId}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  sendMessage(data: any): Observable<{ data: Message }> {
    if (data.file) {
      const formData = new FormData();
      formData.append('conversation', data.conversation.toString());
      formData.append('message', data.message || '');
      formData.append('file', data.file, data.file.name);
      return this.http.post<{ data: Message }>(`${this.baseUrl}messages/post/`, formData, {
        headers: this.getAuthHeaders(),
      });
    } else {
      return this.http.post<{ data: Message }>(`${this.baseUrl}messages/post/`, data, {
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
      });
    }
  }

  createConversation(data: any): Observable<{ data: Conversation }> {
    return this.http.post<{ data: Conversation }>(`${this.baseUrl}conversations/create/`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updateTyping(conversationId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}typing/`, { conversation_id: conversationId }, {
      headers: this.getAuthHeaders(),
    });
  }
}
