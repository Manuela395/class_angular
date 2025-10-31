import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TriageService } from '../../services/triage.service';

@Component({
  selector: 'app-clinical',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clinical.component.html',
  styleUrls: ['./clinical.component.scss']
})
export class ClinicalComponent implements OnInit {
  triages: any[] = [];
  filteredTriages: any[] = [];
  filterText = '';
  openDropdownId: number | null = null;
  selectedTriage: number | null = null;

  constructor(
    private triageService: TriageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTriages();
  }

  toggleDropdown(triageId: number, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === triageId ? null : triageId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  loadTriages() {
    this.triageService.getTriages().subscribe({
      next: (res) => {
        console.log('Triages loaded:', res);
        this.triages = res.clinicals || [];
        this.filteredTriages = [...this.triages];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando triages:', err);
        alert(err.error?.error || 'Error al cargar los triages.');
      }
    });
  }

  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredTriages = this.triages.filter((t: any) =>
      t.appointment?.patient?.name?.toLowerCase().includes(text) ||
      t.appointment?.patient?.identification?.toLowerCase().includes(text)
    );
  }

  goToCreate() {
    this.router.navigate(['/triages/crear']);
  }

  goToUpdate(triageId: number) {
    this.router.navigate(['/triages/actualizar', triageId]);
  }

  deleteTriage(id: number) {
    if (confirm('¿Estás seguro de eliminar este triage?')) {
      this.triageService.deleteTriage(id.toString()).subscribe({
        next: () => {
          alert('Triage eliminado exitosamente.');
          this.loadTriages();
        },
        error: (err) => {
          console.error('Error eliminando triage:', err);
          alert(err.error?.error || 'Error al eliminar triage.');
        }
      });
    }
  }

  onSelectTriage(triageId: number) {
    this.selectedTriage = triageId;
    // Aquí puedes realizar lógica adicional, como emitir evento o guardar el seleccionando
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatHour(hour: string): string {
    if (!hour) return '';
    return hour;
  }

  hasTriageData(triage: any): boolean {
    return triage && (
      triage.smoker !== null ||
      triage.drinker !== null ||
      triage.congenital_diseases ||
      triage.allergies ||
      triage.height_cm ||
      triage.weight_kg
    );
  }
}
