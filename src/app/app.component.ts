import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar.component';
import { ToastComponent } from './shared/toast.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <sb-navbar (search)="goSearch($event)"></sb-navbar>
    <router-outlet></router-outlet>
    <sb-toast></sb-toast>
  `
})
export class AppComponent{
  private router = inject(Router);
  goSearch(q: string){
    this.router.navigate(['/search'], { queryParams: { q } });
  }
}