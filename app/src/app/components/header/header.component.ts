import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { User } from '../../interfaces';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  user: User | null = null;
  searchKey: string = '';
  private searchSubject = new Subject<string>();

  constructor(
    private userService: UserService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.setupSearch();
  }

  loadCurrentUser(): void {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.userService.getUserById(+userId).subscribe({
        next: (response) => {
          this.user = response;
          this.user.profile_image = this.user.profile_image ? `http://localhost:8000${this.user.profile_image}`:
          'avatar.jpg'
        },
        error: (error) => {
          console.error('Error loading user:', error);
          this.logout(); // Log out if user data can't be fetched
        },
      });
    }
  }

  setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300), // Wait 300ms after typing stops
      distinctUntilChanged() // Only emit if the value changes
    ).subscribe(searchTerm => {
      if (searchTerm) {
        // Search users or conversations (implement as needed)
        this.userService.searchUsers(searchTerm).subscribe({
          next: (response) => {
            console.log('Search results:', response.users);
            // Emit or handle search results (e.g., update a parent component)
          },
          error: (error) => console.error('Search error:', error),
        });
      }
    });
  }

  onSearch(): void {
    this.searchSubject.next(this.searchKey);
  }

  openNewChat(): void {
    this.router.navigate(['/dashboard'], { queryParams: { action: 'new-chat' } });
  }

  openNewGroupChat(): void {
    this.router.navigate(['/dashboard'], { queryParams: { action: 'new-group' } });
  }

  openInviteToGroup(): void {
    this.router.navigate(['/dashboard'], { queryParams: { action: 'invite-group' } });
  }

  openProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}