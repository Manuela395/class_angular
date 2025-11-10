import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
})
export class DevicesComponent implements OnInit {
  devices: any[] = [];
  filteredDevices: any[] = [];
  filterText = '';
  openDropdownId: string | null = null;
  loading = false;

  constructor(
    private deviceService: DeviceService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  toggleDropdown(deviceId: string, event: Event) {
    event.stopPropagation();
    this.openDropdownId = this.openDropdownId === deviceId ? null : deviceId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  ngOnInit(): void {
    this.loadDevices();
  }

  // Obtener todos los dispositivos
  loadDevices() {
    this.loading = true;
    this.deviceService.getDevices().subscribe({
      next: (res) => {
        //console.log('Devices loaded:', res);
        this.devices = res.devices || [];
        this.filteredDevices = [...this.devices];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando dispositivos:', err);
        this.loading = false;
        alert('Error cargando dispositivos: ' + (err.error?.error || err.message));
      },
    });
  }

  // Filtrar por nombre o device_id
  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredDevices = this.devices.filter(
      (d) =>
        d.name?.toLowerCase().includes(text) ||
        d.device_id?.toLowerCase().includes(text)
    );
  }

  // Navegar a la página de crear
  goToCreate() {
    this.router.navigate(['/dispositivos/crear']);
  }

  // Navegar a la página de actualizar
  goToUpdate(deviceId: string) {
    this.router.navigate(['/dispositivos/actualizar', deviceId]);
  }

  // Eliminar dispositivo
  deleteDevice(id: string) {
    if (confirm('¿Seguro deseas eliminar este dispositivo?')) {
      this.deviceService.deleteDevice(id).subscribe({
        next: () => {
          alert('Dispositivo eliminado exitosamente.');
          this.loadDevices();
        },
        error: (err) => {
          console.error('Error eliminando dispositivo:', err);
          alert(err.error?.error || 'Error al eliminar dispositivo.');
        }
      });
    }
  }

  // Formatear fecha para mostrar
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '-';
    }
  }
}
