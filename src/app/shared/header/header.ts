import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  showDropdown = false;
  
  constructor(private authService: AuthService) {}
  
  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }
  
  logout() {
    this.authService.logout();
  }
}
