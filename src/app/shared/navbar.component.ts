import { Component, EventEmitter, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sb-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="nav">
    <div class="nav-inner">
      <div style="display:flex; gap:10px; align-items:center;">
        <a class="brand" routerLink="/">
          <div class="logo"></div>
          StreamBox
        </a>
        <a class="pill" routerLink="/mylist">Mi Lista</a>
      </div>

      <div style="display:flex; gap:10px; align-items:center; width:min(740px, 70vw); justify-content:flex-end;">
        <input [value]="q()" (input)="q.set(($any($event.target).value||'').toString())"
               (keydown.enter)="submit()" placeholder="Buscar películas…" />
        <button class="btn primary" (click)="submit()">Buscar</button>
      </div>
    </div>
  </div>
  `
})
export class NavbarComponent{
  q = signal('');
  @Output() search = new EventEmitter<string>();

  submit(){
    const s = this.q().trim();
    if (!s) return;
    this.search.emit(s);
  }
}