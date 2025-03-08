import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../interfaces';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {
  @Input() users: User[] = [];
  @Output() userSelected = new EventEmitter<User>();

  constructor() {}
}