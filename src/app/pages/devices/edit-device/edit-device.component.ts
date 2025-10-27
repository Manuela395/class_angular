import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'app-edit-device',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-device.component.html',
  styleUrls: ['./edit-device.component.scss']
})
export class EditDeviceComponent implements OnInit {
  deviceId: string | null = null;
  device = {
    name: '',
    serial_number: '',
    firmware_version: ''
  };

  constructor(
    private deviceService: DeviceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.deviceId = params['id'];
      this.loadDevice();
    });
  }

  loadDevice() {
    if (this.deviceId) {
      this.deviceService.getDevices().subscribe({
        next: (res) => {
          const device = res.devices?.find((d: any) => d.id === this.deviceId);
          if (device) {
            this.device = {
              name: device.name,
              serial_number: device.serial_number || '',
              firmware_version: device.firmware_version || ''
            };
          }
        },
        error: (err: any) => console.error('Error cargando dispositivo:', err)
      });
    }
  }

  updateDevice() {
    if (!this.device.name || !this.device.serial_number || !this.device.firmware_version) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (this.deviceId) {
      this.deviceService.updateDevice(this.deviceId, this.device).subscribe({
        next: () => {
          alert('Dispositivo actualizado exitosamente.');
          this.router.navigate(['/dispositivos']);
        },
        error: (err: any) => {
          console.error('Error actualizando dispositivo:', err);
          alert('Hubo un error al actualizar el dispositivo.');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dispositivos']);
  }
}

