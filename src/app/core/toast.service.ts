import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  message = signal<string>('');
  show = signal<boolean>(false);

  push(msg: string, ms = 1400){
    this.message.set(msg);
    this.show.set(true);
    window.setTimeout(() => this.show.set(false), ms);
  }
}