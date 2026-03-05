import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'sb-trailer-modal',
  standalone: true,
  template: `
  @if (open) {
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div style="font-weight:950;">Trailer</div>
          <button class="btn icon" (click)="close.emit()">✕</button>
        </div>

        <div style="margin-top:12px; border-radius:14px; overflow:hidden; border:1px solid rgba(255,255,255,.10);">
          <iframe
            [src]="safeUrl"
            width="100%"
            height="420"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      </div>
    </div>
  }
  `
})
export class TrailerModalComponent {
  private sanitizer = inject(DomSanitizer);

  @Input() open = false;

  // OJO: usamos setter para recalcular la SafeResourceUrl cada vez que cambia la key
  private _youtubeKey = '';
  safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');

  @Input()
  set youtubeKey(val: string) {
    this._youtubeKey = val || '';
    const url = this._youtubeKey
      ? `https://www.youtube.com/embed/${this._youtubeKey}?autoplay=1&rel=0`
      : 'about:blank';

    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  get youtubeKey() { return this._youtubeKey; }

  @Output() close = new EventEmitter<void>();
}