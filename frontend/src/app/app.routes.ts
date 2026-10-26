import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'PDF Automation | Batch Document Generator from CSV & Excel'
  },
  {
    path: 'home',
    component: HomeComponent,
    title: 'Workspace | PDF Automation',
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
