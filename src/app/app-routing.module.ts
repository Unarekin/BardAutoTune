import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';

import {
  HomeComponent,
  PlaylistComponent,
  BrowseComponent,
  FreestyleComponent
} from './pages';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'playlist/add',
    component: PlaylistComponent
  },
  {
    path: 'playlist/:id',
    component: PlaylistComponent
  },
  {
    path: 'browse',
    component: BrowseComponent
  },
  {
    path: 'freestyle',
    component: FreestyleComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {};

// export const AppRoutingModule = RouterModule.forRoot(routes, { useHash: true });
