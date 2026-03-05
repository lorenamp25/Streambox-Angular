import { Routes } from '@angular/router';
import { HomePage } from './pages/home.page';
import { SearchPage } from './pages/search.page';
import { DetailsPage } from './pages/details.page';
import { MyListPage } from './pages/mylist.page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'mylist', component: MyListPage },
  { path: 'search', component: SearchPage },
  { path: 'details/:id', component: DetailsPage },
  { path: '**', redirectTo: '' }
];