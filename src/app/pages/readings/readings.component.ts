import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-readings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './readings.component.html',
  styleUrls: ['./readings.component.scss']
})
export class ReadingsComponent implements OnInit {
  readings: any[] = [];
  filteredReadings: any[] = [];
  filterText = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReadings();
  }

  loadReadings() {
    // TODO: Implementar carga de lecturas ECG
    console.log('Cargando lecturas ECG...');
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredReadings = this.readings.filter((r: any) =>
      r.patient?.name?.toLowerCase().includes(text)
    );
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}


