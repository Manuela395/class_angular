import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EcgReadingsService } from '../../../services/ecg-readings.service';
import { Subscription } from 'rxjs';

interface ReadingDetail {
  id: number;
  ecg_session_id: number;
  record_count: number;
  observations: string;
  created_at: string | null;
  patient: {
    id: number;
    name: string;
    last_name: string;
    identification: string;
  } | null;
  doctor: {
    id: number;
    name: string;
    last_name: string;
  } | null;
  data?: number[] | string | { samples?: number[] };
  sample_rate?: number | null;
}

@Component({
  selector: 'app-reading-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reading-detail.component.html',
  styleUrls: ['./reading-detail.component.scss'],
})
export class ReadingDetailComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('ecgCanvas') ecgCanvas?: ElementRef<HTMLCanvasElement>;

  loading = true;
  errorMessage: string | null = null;
  reading: ReadingDetail | null = null;
  samples: number[] = [];
  sampleRate = 250;
  readingIds: number[] = [];
  currentIndex = 0;

  private resizeObserver?: ResizeObserver;
  private routeSub?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly ecgReadingsService: EcgReadingsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    if (this.reading && this.samples.length > 0) {
      this.drawWaveform();
    }
  }

  ngOnInit(): void {
    this.initializeNavigationState();
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const readingId = params.get('id');
      this.loadReading(readingId);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.routeSub?.unsubscribe();
  }

  get patientName(): string {
    if (!this.reading?.patient) return 'N/A';
    const { name, last_name } = this.reading.patient;
    return `${name ?? ''} ${last_name ?? ''}`.trim() || 'N/A';
  }

  get doctorName(): string {
    if (!this.reading?.doctor) return 'N/A';
    const { name, last_name } = this.reading.doctor;
    return `${name ?? ''} ${last_name ?? ''}`.trim() || 'N/A';
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'N/A';
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return value;
      }
      return date.toLocaleString();
    } catch {
      return value;
    }
  }

  goBack(): void {
    this.router.navigate(['/lecturas']);
  }

  get totalRecords(): number {
    if (this.readingIds.length > 0) {
      return this.readingIds.length;
    }
    return this.reading ? 1 : 0;
  }

  get navigationLabel(): string {
    if (this.totalRecords === 0) {
      return '';
    }
    return `Registro ${this.currentIndex + 1} de ${this.totalRecords}`;
  }

  get canGoPrevious(): boolean {
    return this.currentIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentIndex < this.totalRecords - 1;
  }

  goToPrevious(): void {
    if (!this.canGoPrevious) return;
    this.navigateToIndex(this.currentIndex - 1);
  }

  goToNext(): void {
    if (!this.canGoNext) return;
    this.navigateToIndex(this.currentIndex + 1);
  }

  private loadReading(readingId: string | null): void {
    if (!readingId) {
      this.errorMessage = 'Lectura no encontrada.';
      this.loading = false;
      return;
    }

    this.updateCurrentIndex(readingId);

    this.ecgReadingsService.getReadingById(readingId).subscribe({
      next: (res) => {
        this.reading = res.reading ?? null;
        if (!this.reading) {
          this.errorMessage = 'No se encontró la lectura solicitada.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.samples = this.extractSamples(this.reading.data);
        this.sampleRate =
          (typeof this.reading.sample_rate === 'number' && this.reading.sample_rate > 0
            ? this.reading.sample_rate
            : 250);

        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.initializeCanvas(), 50);
      },
      error: (err) => {
        console.error('Error obteniendo lectura ECG:', err);
        this.errorMessage = err.error?.error || 'Error al cargar la lectura ECG.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private navigateToIndex(index: number): void {
    const targetId = this.readingIds[index];
    if (!targetId) {
      return;
    }

    this.router.navigate(['/lecturas/detalle', targetId], {
      queryParams: { ids: this.readingIds.join(',') },
      state: { readingIds: this.readingIds },
    });
  }

  private initializeNavigationState(): void {
    const navState = (this.router.getCurrentNavigation()?.extras.state ?? {}) as {
      readingIds?: number[];
    };
    const historyState = (window.history.state ?? {}) as { readingIds?: number[] };
    const queryIds = this.route.snapshot.queryParamMap.get('ids');

    const idsFromState = Array.isArray(navState.readingIds)
      ? navState.readingIds
      : Array.isArray(historyState.readingIds)
      ? historyState.readingIds
      : [];

    const idsFromQuery = this.parseIdList(queryIds);

    const sourceIds = idsFromState.length ? idsFromState : idsFromQuery;

    this.readingIds = sourceIds
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
      .sort((a, b) => a - b);
  }

  private parseIdList(value: string | null): number[] {
    if (!value) return [];
    return value
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((num) => Number.isInteger(num) && num > 0);
  }

  private updateCurrentIndex(readingId: string): void {
    const numericId = Number(readingId);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      this.currentIndex = 0;
      return;
    }

    if (!this.readingIds.includes(numericId)) {
      this.readingIds = [...this.readingIds, numericId].sort((a, b) => a - b);
    }

    this.currentIndex = Math.max(this.readingIds.indexOf(numericId), 0);
  }

  private extractSamples(raw: ReadingDetail['data']): number[] {
    if (!raw) return [];

    if (Array.isArray(raw)) {
      return raw.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    }

    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((value) => Number(value)).filter((value) => Number.isFinite(value));
        }
        if (parsed && Array.isArray(parsed.samples)) {
          return parsed.samples
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value));
        }
      } catch (error) {
        console.warn('No se pudo parsear la señal ECG almacenada:', error);
      }
      return [];
    }

    if (typeof raw === 'object' && raw !== null && Array.isArray(raw.samples)) {
      return raw.samples
        .map((value: unknown) => Number(value))
        .filter((value: number) => Number.isFinite(value));
    }

    return [];
  }

  private initializeCanvas(): void {
    if (!this.ecgCanvas) return;
    const canvas = this.ecgCanvas.nativeElement;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = 240 * dpr;
    canvas.style.width = `${parent.clientWidth}px`;
    canvas.style.height = `240px`;

    this.drawWaveform();
    this.setupResizeObserver();
  }

  private setupResizeObserver(): void {
    if (!this.ecgCanvas) return;
    const parent = this.ecgCanvas.nativeElement.parentElement;
    if (!parent) return;

    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.initializeCanvas();
    });
    this.resizeObserver.observe(parent);
  }

  private drawWaveform(): void {
    if (!this.ecgCanvas) return;
    const canvas = this.ecgCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!this.samples.length) {
      this.drawNoDataMessage(ctx, canvas);
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);

    this.drawGrid(ctx, width, height);
    this.drawSignal(ctx, width, height);

    ctx.restore();
  }

  private drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const smallStep = 20;
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = '#e5e7eb';

    for (let x = 0; x <= width; x += smallStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += smallStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#cbd5f5';
    const majorStep = smallStep * 5;
    for (let x = 0; x <= width; x += majorStep) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += majorStep) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  private drawSignal(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const samplesToShow = Math.min(this.samples.length, this.sampleRate * 60);
    const offset = this.samples.length > samplesToShow ? this.samples.length - samplesToShow : 0;
    const samples = this.samples.slice(offset);

    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const amplitude = max - min || 1;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    samples.forEach((value, index) => {
      const x = (index / (samples.length - 1)) * width;
      const normalized = (value - min) / amplitude;
      const y = height - normalized * (height * 0.8) - height * 0.1;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  private drawNoDataMessage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No hay datos de señal ECG almacenados para esta lectura.', width / 2, height / 2);
    ctx.restore();
  }
}

