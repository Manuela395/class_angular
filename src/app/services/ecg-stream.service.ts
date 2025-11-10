import { Injectable, NgZone, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface EcgStreamBlock {
  device_id: string;
  fs_hz: number;
  n: number;
  units: 'mV';
  samples: number[];
  t?: number;
  bpm?: number; 
  signalQuality?: string;
  rpiks?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class EcgStreamService {
  private zone = inject(NgZone);
  private eventSource?: EventSource;
  private reconnectTimeout?: any;

  public stream$ = new Subject<EcgStreamBlock>();

  constructor() {}

  // Conectar al stream SSE
  connect(deviceId?: string): void {
    const baseUrl = 'http://localhost:4000/api';
    const url = `${baseUrl}/ecgstream/stream${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`;

    //console.log('🔄 Conectando a ECG Stream:', url);

    this.disconnect();

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      this.zone.run(() => {
        try {
          const data: EcgStreamBlock = JSON.parse(event.data);
          this.stream$.next(data);
        } catch (error) {
          console.error('❌ Error parseando datos ECG:', error);
        }
      });
    };

    this.eventSource.onerror = (error) => {
      console.error('❌ Error en ECG Stream:', error);
      this.disconnect();
      
      // Reconexión automática después de 2 segundos
      this.reconnectTimeout = setTimeout(() => {
        //console.log('🔄 Reconectando ECG Stream...');
        this.connect(deviceId);
      }, 2000);
    };

    this.eventSource.onopen = () => {
      //console.log('✅ ECG Stream conectado');
    };
  }

  // Desconectar
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
      //console.log('🔌 ECG Stream desconectado');
    }
  }

  // Obtener datos recientes (para inicialización)
  getRecentData(seconds: number = 10, deviceId?: string): Observable<any> {
    // Necesitarías implementar HTTP client para esto

    return new Observable();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}