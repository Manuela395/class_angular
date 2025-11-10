import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { EcgStreamService, EcgStreamBlock } from '../../../../services/ecg-stream.service';
import { sign } from 'chart.js/helpers';

@Component({
  selector: 'app-ecg-monitor-embedded',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecg-monitor.html' ,
  styleUrls: ['./ecg-monitor.scss'] 
})
export class EcgMonitorEmbeddedComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  @Input() deviceId?: string;  // ← Recibe deviceId del componente padre
  @Output() dataReceived = new EventEmitter<any>(); // ← Emite datos cuando llegan

  // Configuración para embedded (más pequeña)
  WINDOW_MS = 6000; // 6 segundos en vez de 10

  // Datos
  private xs: number[] = [];
  private ys: number[] = [];
  public fs = 250;
  public bpm = 0;
  public isConnected = false;

  private ctx!: CanvasRenderingContext2D;
  private streamSubscription?: Subscription;

  constructor(private ecgStreamService: EcgStreamService) {}

  ngOnInit(): void {
    this.initializeCanvas();
  }

  // Métodos públicos para control desde el padre
  connect(): void {
    this.isConnected = true;
    this.ecgStreamService.connect(this.deviceId);
    
    this.streamSubscription = this.ecgStreamService.stream$.subscribe(
      (block: EcgStreamBlock) => this.processDataBlock(block)
    );
  }

  disconnect(): void {
    this.isConnected = false;
    this.streamSubscription?.unsubscribe();
    this.ecgStreamService.disconnect();
    this.clearCanvas();
  }

  private initializeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('No se pudo obtener el contexto 2D del canvas');
      return;
    }
    
    this.ctx = ctx;
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    
    if (container) {
      canvas.width = container.clientWidth - 32; // Padding
      canvas.height = 120; // Altura más compacta para embedded
    }
  }

  private processDataBlock(block: EcgStreamBlock): void {
    if (block.fs_hz && block.fs_hz !== this.fs) {
      this.fs = block.fs_hz;
    }

    this.bpm = block.bpm || 0;

    // Emitir datos al componente padre (por si los necesita)
    this.dataReceived.emit({
      bpm: this.bpm,
      samples: block.samples,
      fs: this.fs,
      signalQuality: block.signalQuality || 'unknown',
      rpiks: block.rpiks || []
      
    });

    const dt_ms = 1000 / this.fs;
    let currentTime = this.xs.length > 0 
      ? this.xs[this.xs.length - 1] + dt_ms 
      : Date.now();

    // Agregar nuevos datos
    for (const sample of block.samples) {
      this.xs.push(currentTime);
      this.ys.push(sample);
      currentTime += dt_ms;
    }

    // Mantener ventana
    this.trimToWindow();
    this.redrawCanvas();
  }

  private trimToWindow(): void {
    const currentTime = this.xs.length > 0 ? this.xs[this.xs.length - 1] : Date.now();
    const minTime = currentTime - this.WINDOW_MS;

    while (this.xs.length > 0 && this.xs[0] < minTime) {
      this.xs.shift();
      this.ys.shift();
    }
  }

  private redrawCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.ctx.clearRect(0, 0, width, height);

    if (this.xs.length < 2) {
      this.drawNoDataMessage();
      return;
    }

    const { xScale, yScale } = this.calculateScales(width, height);
    this.drawECGSignal(xScale, yScale);
  }

  private calculateScales(width: number, height: number) {
    const currentTime = this.xs[this.xs.length - 1];
    const minTime = currentTime - this.WINDOW_MS;

    const xScale = (time: number) => {
      const ratio = (time - minTime) / this.WINDOW_MS;
      return ratio * width;
    };

    const yMin = Math.min(...this.ys);
    const yMax = Math.max(...this.ys);
    const padding = Math.max(20, (yMax - yMin) * 0.1);
    
    const yScale = (value: number) => {
      const ratio = (value - (yMin - padding)) / ((yMax + padding) - (yMin - padding));
      return height - (ratio * height);
    };

    return { xScale, yScale };
  }

  private drawECGSignal(xScale: (time: number) => number, yScale: (value: number) => number): void {
    this.ctx.strokeStyle = '#e74c3c'; // Rojo ECG para mejor visibilidad
    this.ctx.lineWidth = 1.5;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(xScale(this.xs[0]), yScale(this.ys[0]));

    for (let i = 1; i < this.xs.length; i++) {
      this.ctx.lineTo(xScale(this.xs[i]), yScale(this.ys[i]));
    }

    this.ctx.stroke();
  }

  private drawNoDataMessage(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.width;
    const height = canvas.height;

    this.ctx.fillStyle = '#999';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Esperando señal ECG...', width / 2, height / 2);
  }

  private clearCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawNoDataMessage();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}