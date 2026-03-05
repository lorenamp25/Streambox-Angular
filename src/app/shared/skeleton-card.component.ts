import { Component } from '@angular/core';

@Component({
  selector: 'sb-skeleton-card',
  standalone: true,
  template: `
    <div class="card sk">
      <div class="poster"></div>
      <div class="card-meta">
        <div class="sk-line w80"></div>
        <div class="sk-line w55" style="margin-top:8px;"></div>
      </div>
    </div>
  `
})
export class SkeletonCardComponent {}