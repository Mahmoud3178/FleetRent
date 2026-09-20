import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { UserDto } from '../../core/models/auth.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  loading = signal(true);
  users = signal<UserDto[]>([]);
  roleFilter = signal('All');

  filteredUsers = computed(() => {
    const role = this.roleFilter();
    return role === 'All' ? this.users() : this.users().filter((u) => u.role === role);
  });

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  roleBadge(role: string): string {
    switch (role) {
      case 'Admin': return 'badge-danger';
      case 'Employee': return 'badge-info';
      default: return 'badge-success';
    }
  }
}
