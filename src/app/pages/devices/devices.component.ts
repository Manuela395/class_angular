import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  // Modal
  showModal = false;
  editMode = false;
  selectedDevice: any = {
    name: '',
    serial_number: '',
    firmware_version: '',
  };

  constructor(private deviceService: DeviceService) {}

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
        d.name.toLowerCase().includes(text) ||
        d.serial_number.toLowerCase().includes(text)
    );
  }

  // Abrir modal de crear / editar
  openModal(device?: any) {
    if (device) {
      this.selectedDevice = { ...device };
      this.editMode = true;
    } else {
      this.selectedDevice = {
        name: '',
        serial_number: '',
        firmware_version: '',
      };
      this.editMode = false;
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  // Crear o actualizar dispositivo
  saveDevice() {
    if (this.editMode) {
      this.deviceService
        .updateDevice(this.selectedDevice.id, this.selectedDevice)
        .subscribe({
          next: () => {
            this.loadDevices();
            this.closeModal();
          },
          error: (err) => console.error('Error actualizando dispositivo:', err),
        });
    } else {
      this.deviceService.createDevice(this.selectedDevice).subscribe({
        next: () => {
          this.loadDevices();
          this.closeModal();
        },
        error: (err) => console.error('Error creando dispositivo:', err),
      });
    }
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
