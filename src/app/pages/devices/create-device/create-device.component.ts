import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-create-device',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-device.component.html',
  styleUrls: ['./create-device.component.scss']
})
export class CreateDeviceComponent {
  newDevice = {
    name: '',
    serial_number: '',
    firmware_version: ''
  };

  constructor(
    private deviceService: DeviceService,
    private router: Router
  ) {}

  saveDevice() {
    if (!this.newDevice.name || !this.newDevice.serial_number || !this.newDevice.firmware_version) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    this.deviceService.createDevice(this.newDevice).subscribe({
      next: (response) => {
        console.log('Dispositivo creado:', response);
        alert('Dispositivo creado exitosamente.');
        this.router.navigate(['/dispositivos']);
      },
      error: (err) => {
        console.error('Error creando dispositivo:', err);
        
        // Mostrar el error específico del servidor si existe
        let errorMessage = 'Hubo un error al crear el dispositivo.';
        if (err.error?.error) {
          errorMessage = `Error: ${err.error.error}`;
        } else if (err.error?.details) {
          errorMessage = `Error: ${err.error.details}`;
        }
        
        alert(errorMessage);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dispositivos']);
  }
}

