import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TmdbService } from '../core/tmdb.service';
import { ListService } from '../core/list.service';
import { RowCarouselComponent } from '../shared/row-carousel.component';

@Component({
  standalone: true,
  imports: [RowCarouselComponent],
  template: `
  <div class="container">
    @if (error()) {
      <div class="panel">
        <h3 style="margin:0 0 8px;">Error</h3>
        <small>{{ error() }}</small>
      </div>
    }

    @if (hero()) {
      <div class="hero" style="height:420px;">
        <img [src]="heroBackdrop()" style="width:100%;height:100%;object-fit:cover; display:block;" />
        <div class="overlay"></div>
        <div class="content">
          <h1 style="font-weight:950; font-size:42px;">{{ hero()!.title }}</h1>
          <small style="display:block; margin-top:10px; max-width:720px; line-height:1.5;">
            {{ hero()!.overview }}
          </small>
          <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
            <button class="btn primary" (click)="goDetails(hero()!.id)">Ver detalles</button>
            <button class="btn" (click)="toggleList(hero()!.id)">
              {{ inList(hero()!.id) ? '✓ En mi lista' : '+ Mi lista' }}
            </button>
            <span class="pill">⭐ {{ hero()!.vote_average?.toFixed?.(1) ?? hero()!.vote_average }}</span>
            <span class="pill">📅 {{ hero()!.release_date || '—' }}</span>
          </div>
        </div>
      </div>
    }

    <sb-row-carousel
      title="Tendencias"
      subtitle="Semana"
      [items]="trending()"
      [loading]="loadingTrending()"
      [imgFn]="img"
      [inListFn]="inList"
      (open)="goDetails($event)"
      (toggleList)="toggleList($event)"
    />

    <sb-row-carousel
      title="Populares"
      subtitle="Ahora mismo"
      [items]="popular()"
      [loading]="loadingPopular()"
      [imgFn]="img"
      [inListFn]="inList"
      (open)="goDetails($event)"
      (toggleList)="toggleList($event)"
    />

    <sb-row-carousel
      title="Top rated"
      subtitle="Mejor valoradas"
      [items]="top()"
      [loading]="loadingTop()"
      [imgFn]="img"
      [inListFn]="inList"
      (open)="goDetails($event)"
      (toggleList)="toggleList($event)"
    />

    @for (row of genreRows(); track row.id) {
      <sb-row-carousel
        [title]="row.name"
        subtitle="Por género"
        [items]="row.items"
        [loading]="row.loading"
        [imgFn]="img"
        [inListFn]="inList"
        (open)="goDetails($event)"
        (toggleList)="toggleList($event)"
      />
    }
  </div>
  `
})
export class HomePage{
  private api = inject(TmdbService);
  private list = inject(ListService);
  private router = inject(Router);

  trending = signal<any[]>([]);
  popular  = signal<any[]>([]);
  top      = signal<any[]>([]);
  hero     = signal<any | null>(null);
  error    = signal<string>('');

  loadingTrending = signal(true);
  loadingPopular  = signal(true);
  loadingTop      = signal(true);

  // 👇 ESTO VA DENTRO DE LA CLASE
  genres    = signal<{id:number; name:string}[]>([]);
  genreRows = signal<{ id:number; name:string; items:any[]; loading:boolean }[]>([]);

  ids = signal<number[]>(this.list.getIds());

  constructor(){
    this.load();
  }

  img = (path: string | null) => {
    return path ? this.api.img(path, 'w342') : 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600">
        <rect width="100%" height="100%" fill="rgba(255,255,255,0.06)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          fill="rgba(255,255,255,0.5)" font-size="18">No poster</text>
      </svg>`
    );
  };

  heroBackdrop(){
    const b = this.hero()?.backdrop_path ?? null;
    return b ? this.api.img(b, 'w780') : '';
  }

  inList = (id: number) => this.ids().includes(id);

  toggleList(id: number){
    this.ids.set(this.list.toggle(id));
  }

  async load(){
    try{
      this.error.set('');

      this.loadingTrending.set(true);
      this.api.trending(1).then(res => {
        this.trending.set((res.results || []).slice(0, 18));
        this.hero.set((res.results || []).find((x:any) => x.backdrop_path) ?? (res.results || [])[0] ?? null);
      }).finally(() => this.loadingTrending.set(false));

      this.loadingPopular.set(true);
      this.api.popular(1).then(res => {
        this.popular.set((res.results || []).slice(0, 18));
      }).finally(() => this.loadingPopular.set(false));

      this.loadingTop.set(true);
      this.api.topRated(1).then(res => {
        this.top.set((res.results || []).slice(0, 18));
      }).finally(() => this.loadingTop.set(false));

      // ✅ Géneros + filas
      try{
        const g = await this.api.genres();
        const topGenres = (g.genres || []).slice(0, 6);
        this.genres.set(topGenres);

        this.genreRows.set(topGenres.map(x => ({ id:x.id, name:x.name, items:[], loading:true })));

        for (const gen of topGenres){
          this.api.discoverByGenre(gen.id, 1).then(res => {
            this.genreRows.update(rows => rows.map(r =>
              r.id === gen.id ? ({...r, items: (res.results || []).slice(0, 18), loading:false}) : r
            ));
          }).catch(() => {
            this.genreRows.update(rows => rows.map(r =>
              r.id === gen.id ? ({...r, loading:false}) : r
            ));
          });
        }
      }catch{
        // si falla, simplemente no se muestran filas de géneros
      }

    }catch(e:any){
      this.error.set(e?.message ?? 'Error cargando datos');
    }
  }

  goDetails(id: number){
    this.router.navigate(['/details', id]);
  }
}