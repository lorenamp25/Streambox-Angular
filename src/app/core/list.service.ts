import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ListService {
  private KEY = 'sb_mylist_v1';

  getIds(): number[] {
    try{
      const raw = localStorage.getItem(this.KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    }catch{
      return [];
    }
  }

  has(id: number): boolean {
    return this.getIds().includes(id);
  }

  toggle(id: number): number[] {
    const ids = this.getIds();
    const next = ids.includes(id) ? ids.filter(x => x !== id) : [id, ...ids];
    localStorage.setItem(this.KEY, JSON.stringify(next));
    return next;
  }

  clear(){
    localStorage.removeItem(this.KEY);
  }
}