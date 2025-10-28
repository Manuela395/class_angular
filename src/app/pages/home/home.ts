import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  user = JSON.parse(localStorage.getItem('user') || '{}');

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Redirigir según el rol
    const roleCode = this.user.role?.code || this.user.role;
    
    if (roleCode === 'admin') {
      // Admin ve dashboard o usa /usuarios como página principal
      this.router.navigate(['/usuarios']);
    } else if (roleCode === 'admin_aux') {
      // Admin auxiliar ve citas
      this.router.navigate(['/citas']);
    } else if (roleCode === 'doc') {
      // Doctor ve consultas
      this.router.navigate(['/consultas']);
    }
  }
}
