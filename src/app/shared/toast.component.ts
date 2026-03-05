import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'sb-toast',
  standalone: true,
  template: `
  @if (toast.show()) {
    <div class="toast">
      {{ toast.message() }}
    </div>
  }
  `
})
export class ToastComponent{
  toast = inject(ToastService);
}