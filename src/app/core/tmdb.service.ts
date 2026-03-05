import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { TmdbMovie, TmdbPaged } from '../models/tmdb.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private base = environment.tmdbBaseUrl;
  private key = environment.tmdbApiKey;

  img(path: string | null, size: 'w342'|'w500'|'w780'|'original' = 'w500'){
    return path ? `${environment.imgBase}/${size}${path}` : '';
  }

  private async get<T>(path: string, params: Record<string,string|number> = {}): Promise<T>{
    if (!this.key || this.key.includes('PON_AQUI')){
      throw new Error('Falta TMDB API key en environment.ts');
    }
    const url = new URL(`${this.base}${path}`);
    url.searchParams.set('api_key', this.key);
    url.searchParams.set('language', 'es-ES');
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, String(v)));

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    return res.json() as Promise<T>;
  }

  trending(page=1){ return this.get<TmdbPaged<TmdbMovie>>('/trending/movie/week', { page }); }
  topRated(page=1){ return this.get<TmdbPaged<TmdbMovie>>('/movie/top_rated', { page }); }
  popular(page=1){ return this.get<TmdbPaged<TmdbMovie>>('/movie/popular', { page }); }
  search(query: string, page=1){ return this.get<TmdbPaged<TmdbMovie>>('/search/movie', { query, page, include_adult: 0 }); }
  details(id: number){ return this.get<any>(`/movie/${id}`); }
  genres() {
  return this.get<{ genres: { id: number; name: string }[] }>('/genre/movie/list');
}

// Discover por género
discoverByGenre(genreId: number, page = 1) {
  return this.get<any>('/discover/movie', {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page
  });
}

// Trailers / vídeos
videos(id: number) {
  return this.get<{ results: any[] }>(`/movie/${id}/videos`);
}
}
