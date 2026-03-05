import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TmdbService } from '../core/tmdb.service';
import { TrailerModalComponent } from '../shared/trailer-modal.component';

@Component({
  standalone: true,
  imports: [RouterLink, TrailerModalComponent],
  template: `
  <div class="container">
    <a class="pill" routerLink="/">← Volver</a>

    @if (error()) {
      <div class="panel" style="margin-top:14px;">
        <small>{{ error() }}</small>
      </div>
    }

    @if (movie()) {
      <div class="details" style="margin-top:14px;">
        <div class="panel">
          <img [src]="poster()" style="width:100%; border-radius:14px; display:block;" />
        </div>

        <div class="panel">
          <h1 style="font-weight:950; font-size:40px;">{{ movie().title }}</h1>
          <small style="display:block; margin-top:8px;">
            ⭐ {{ movie().vote_average?.toFixed?.(1) ?? movie().vote_average }} · 📅 {{ movie().release_date || '—' }}
            · ⏱️ {{ movie().runtime ? (movie().runtime + ' min') : '—' }}
          </small>

          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;">
            @if (trailerKey()) {
              <button class="btn primary" (click)="openTrailer.set(true)">▶ Ver trailer</button>
            }
            <a class="btn" [href]="tmdbLink()" target="_blank" rel="noreferrer">Ver en TMDB</a>
          </div>

          <hr />

          <div style="color:var(--muted); line-height:1.7;">
            {{ movie().overview || 'Sin sinopsis disponible.' }}
          </div>

          <hr />

          @if (movie().genres?.length) {
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              @for (g of movie().genres; track g.id) { <span class="pill">{{ g.name }}</span> }
            </div>
          }
        </div>
      </div>

      <sb-trailer-modal
        [open]="openTrailer()"
        [youtubeKey]="trailerKey()"
        (close)="openTrailer.set(false)"
      />
    }
  </div>
  `
})
export class DetailsPage{
  private api = inject(TmdbService);
  private route = inject(ActivatedRoute);

  movie = signal<any | null>(null);
  error = signal('');

  trailerKey = signal<string>('');
  openTrailer = signal(false);

  constructor(){
    this.route.paramMap.subscribe(pm => {
      const id = Number(pm.get('id') || 0);
      if (id) this.load(id);
    });
  }

  poster(){
    const p = this.movie()?.poster_path ?? null;
    return p ? this.api.img(p, 'w500') : '';
  }

  tmdbLink(){
    const id = this.movie()?.id;
    return id ? `https://www.themoviedb.org/movie/${id}` : 'https://www.themoviedb.org/';
  }

  async load(id: number){
    try{
      this.error.set('');
      this.trailerKey.set('');

      const m = await this.api.details(id);
      this.movie.set(m);

      // buscar trailer de YouTube
      const v = await this.api.videos(id);
      const yt = (v.results || []).find((x:any) =>
        x.site === 'YouTube' && (x.type === 'Trailer' || x.type === 'Teaser')
      );
      if (yt?.key) this.trailerKey.set(yt.key);

    }catch(e:any){
      this.error.set(e?.message ?? 'Error cargando detalles');
    }
  }
}