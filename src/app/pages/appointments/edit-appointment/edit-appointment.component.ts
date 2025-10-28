import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-appointment.component.html',
  styleUrls: ['./edit-appointment.component.scss']
})
export class EditAppointmentComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/citas']);
  }
}

