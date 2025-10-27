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

  constructor(private deviceService: DeviceService, private router: Router) {}

  ngOnInit(): void {
    this.loadDevices();
  }

  // Obtener todos los dispositivos
  loadDevices() {
    this.deviceService.getDevices().subscribe({
      next: (res) => {
        this.devices = res.devices || [];
        this.filteredDevices = [...this.devices]; 
      },
      error: (err) => console.error('Error cargando dispositivos:', err),
    });
  }

  // Filtrar por nombre o número de serie
  applyFilter() {
    const text = this.filterText.toLowerCase();
    this.filteredDevices = this.devices.filter(
      (d) =>
        d.name?.toLowerCase().includes(text) ||
        d.serial_number?.toLowerCase().includes(text)
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
        next: () => this.loadDevices(),
        error: (err) => console.error('Error eliminando dispositivo:', err),
      });
    }
  }
}
