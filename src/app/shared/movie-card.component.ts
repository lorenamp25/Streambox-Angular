import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TmdbMovie } from '../models/tmdb.model';

@Component({
  selector: 'sb-movie-card',
  standalone: true,
  template: `
  <div class="card movie" (click)="open.emit(movie.id)">
    <img class="poster" [src]="posterUrl" [alt]="movie.title" />

    <div class="hover">
      <div class="hover-top">
        <button class="btn icon primary"
                (click)="open.emit(movie.id); $event.stopPropagation()">
          ▶
        </button>

        <button class="btn icon"
                [class.on]="inList"
                (click)="toggleList.emit(movie.id); $event.stopPropagation()"
                [title]="inList ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'">
          {{ inList ? '✓' : '+' }}
        </button>
      </div>

      <div class="hover-meta">
        <div class="t">{{ movie.title }}</div>
      <div class="m">⭐ {{ movie.vote_average.toFixed(1) }}</div>
      </div>
    </div>

    <div class="card-meta">
      <div class="t">{{ movie.title }}</div>
      <div class="m">⭐ {{ movie.vote_average.toFixed(1) }}</div>
    </div>
  </div>
  `
})
export class MovieCardComponent{
  @Input({required:true}) movie!: TmdbMovie;
  @Input({required:true}) posterUrl!: string;

  @Input() inList: boolean = false;

  @Output() open = new EventEmitter<number>();
  @Output() toggleList = new EventEmitter<number>();
}