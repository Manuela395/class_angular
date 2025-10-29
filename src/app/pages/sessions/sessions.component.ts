import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sessions.component.html',
  styleUrls: ['./sessions.component.scss']
})
export class SessionsComponent implements OnInit {
  sessions: any[] = [];
  filteredSessions: any[] = [];
  filterText = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions() {
    // TODO: Implementar carga de sesiones ECG
    console.log('Cargando sesiones ECG...');
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredSessions = this.sessions.filter((s: any) =>
      s.patient?.name?.toLowerCase().includes(text)
    );
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}


