import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MovieCardComponent } from './movie-card.component';
import { SkeletonCardComponent } from './skeleton-card.component';

@Component({
  selector: 'sb-row-carousel',
  standalone: true,
  imports: [MovieCardComponent, SkeletonCardComponent],
  template: `
  <div class="row">
    <div class="row-head">
      <h2 style="font-weight:950; margin:0;">{{ title }}</h2>
      <div style="display:flex; gap:8px; align-items:center;">
        <small style="color:var(--muted)">{{ subtitle }}</small>
        <button class="btn icon" (click)="scroll(-1)">←</button>
        <button class="btn icon" (click)="scroll(1)">→</button>
      </div>
    </div>

    <div class="row-track" #track (wheel)="onWheel($event)">
      @if (loading) {
        @for (i of skeletons; track i) { <sb-skeleton-card /> }
      } @else {
        @for (m of items; track m.id) {
          <sb-movie-card
            [movie]="m"
            [posterUrl]="imgFn(m.poster_path)"
            [inList]="inListFn(m.id)"
            (open)="open.emit($event)"
            (toggleList)="toggleList.emit($event)"
          />
        }
      }
    </div>
  </div>
  `
})
export class RowCarouselComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle: string = '';
  @Input() items: any[] = [];
  @Input() loading: boolean = false;

  @Input({ required: true }) imgFn!: (path: string|null) => string;
  @Input({ required: true }) inListFn!: (id: number) => boolean;

  @Output() open = new EventEmitter<number>();
  @Output() toggleList = new EventEmitter<number>();

  @ViewChild('track') track!: ElementRef<HTMLDivElement>;

  skeletons = Array.from({ length: 10 }, (_, i) => i);

  scroll(dir: 1 | -1){
    const el = this.track.nativeElement;
    el.scrollBy({ left: dir * 520, behavior: 'smooth' });
  }

  onWheel(e: WheelEvent){
    // Convierte scroll vertical en horizontal (vibe Netflix)
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      e.preventDefault();
      this.track.nativeElement.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }
}