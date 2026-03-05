import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../core/tmdb.service';
import { MovieCardComponent } from '../shared/movie-card.component';

@Component({
  standalone: true,
  imports: [MovieCardComponent],
  template: `
  <div class="container">
    <div class="panel">
      <h2 style="font-weight:950;">Resultados</h2>
      <small>Buscando: <b>{{ q() }}</b></small>
    </div>

    @if (error()) {
      <div class="panel" style="margin-top:14px;">
        <small>{{ error() }}</small>
      </div>
    }

    <div class="grid" style="margin-top:14px;">
      @for (m of results(); track m.id) {
        <sb-movie-card [movie]="m" [posterUrl]="img(m.poster_path)" (open)="goDetails($event)"></sb-movie-card>
      }
    </div>

    @if (results().length) {
      <div style="display:flex; justify-content:center; margin-top:18px;">
        <button class="btn" (click)="loadMore()" [disabled]="loading()">Cargar más</button>
      </div>
    }
  </div>
  `
})
export class SearchPage{
  private api = inject(TmdbService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  q = signal('');
  page = signal(1);
  results = signal<any[]>([]);
  loading = signal(false);
  error = signal('');

  constructor(){
    this.route.queryParamMap.subscribe(pm => {
      const query = (pm.get('q') ?? '').trim();
      this.q.set(query);
      this.page.set(1);
      this.results.set([]);
      if (query) this.search();
    });
  }

  img(path: string | null){
    return path ? this.api.img(path, 'w342') : 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
        <rect width="100%" height="100%" fill="rgba(255,255,255,0.06)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="18">No poster</text>
      </svg>`
    );
  }

  async search(){
    try{
      this.loading.set(true);
      this.error.set('');
      const res = await this.api.search(this.q(), this.page());
      this.results.update(arr => [...arr, ...res.results]);
    }catch(e:any){
      this.error.set(e?.message ?? 'Error en búsqueda');
    }finally{
      this.loading.set(false);
    }
  }

  loadMore(){
    this.page.update(p => p + 1);
    this.search();
  }

  goDetails(id: number){
    this.router.navigate(['/details', id]);
  }
  private onScroll = () => {
  if (this.loading()) return;
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;
  if (nearBottom) this.loadMore();
};

ngOnInit(){
  window.addEventListener('scroll', this.onScroll, { passive: true });
}

ngOnDestroy(){
  window.removeEventListener('scroll', this.onScroll);
}
}