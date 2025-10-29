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
    device_id: '',
    firmware: ''
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
      this.deviceService.getDevice(this.deviceId).subscribe({
        next: (res) => {
          const device = res.device;
          if (device) {
            this.device = {
              name: device.name || '',
              device_id: device.device_id || '',
              firmware: device.firmware || ''
            };
          }
        },
        error: (err: any) => {
          console.error('Error cargando dispositivo:', err);
          alert(err.error?.error || 'Error al cargar el dispositivo.');
        }
      });
    }
  }

  updateDevice() {
    if (!this.device.name || !this.device.firmware) {
      alert('Por favor, completa todos los campos obligatorios.');
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
          const errorMsg = err.error?.error || 'Hubo un error al actualizar el dispositivo.';
          alert(errorMsg);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/dispositivos']);
  }
}

