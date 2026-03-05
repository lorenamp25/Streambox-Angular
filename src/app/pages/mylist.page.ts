import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ListService } from '../core/list.service';
import { TmdbService } from '../core/tmdb.service';
import { MovieCardComponent } from '../shared/movie-card.component';
import { SkeletonCardComponent } from '../shared/skeleton-card.component';

@Component({
  standalone: true,
  imports: [MovieCardComponent, SkeletonCardComponent],
  template: `
  <div class="container">
    <div class="panel">
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center;">
        <div>
          <h2 style="font-weight:950; margin:0;">Mi Lista</h2>
          <small>{{ ids().length }} guardadas</small>
        </div>
        <button class="btn" (click)="clear()">Vaciar</button>
      </div>
    </div>

    @if (loading()) {
      <div class="grid" style="margin-top:14px;">
        @for (i of skeletons; track i) { <sb-skeleton-card /> }
      </div>
    } @else {
      @if (!movies().length) {
        <div class="panel" style="margin-top:14px;">
          <small>No tienes nada en tu lista todavía. Añade desde Home con el botón “+”.</small>
        </div>
      } @else {
        <div class="grid" style="margin-top:14px;">
          @for (m of movies(); track m.id) {
            <sb-movie-card
              [movie]="m"
              [posterUrl]="img(m.poster_path)"
              [inList]="true"
              (open)="goDetails($event)"
              (toggleList)="toggle($event)"
            />
          }
        </div>
      }
    }
  </div>
  `
})
export class MyListPage{
  private api = inject(TmdbService);
  private list = inject(ListService);
  private router = inject(Router);

  ids = signal<number[]>(this.list.getIds());
  movies = signal<any[]>([]);
  loading = signal(false);
  skeletons = Array.from({length: 12}, (_,i)=>i);

  constructor(){
    this.load();
  }

  img(path: string | null){
    return path ? this.api.img(path, 'w342') : 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
        <rect width="100%" height="100%" fill="rgba(255,255,255,0.06)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="18">No poster</text>
      </svg>`
    );
  }

  inList = (id: number) => this.ids().includes(id);

  async load(){
    const ids = this.ids();
    if (!ids.length){ this.movies.set([]); return; }

    try{
      this.loading.set(true);
      // TMDB: details por id (varias llamadas)
      const data = await Promise.all(ids.slice(0, 30).map(id => this.api.details(id)));
      this.movies.set(data);
    }finally{
      this.loading.set(false);
    }
  }

  toggle(id: number){
    this.ids.set(this.list.toggle(id));
    this.load();
  }

  clear(){
    this.list.clear();
    this.ids.set([]);
    this.movies.set([]);
  }

  goDetails(id: number){
    this.router.navigate(['/details', id]);
  }
}