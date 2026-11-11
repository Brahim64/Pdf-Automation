import { Routes } from '@angular/router';
import { LandingComponent } from './features/landing/landing.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NewAutomationComponent } from './features/new-automation/new-automation.component';
import { AutomationLabComponent } from './features/automation-lab/automation-lab.component';
import { WorkspacePlaceholderComponent } from './features/workspace-placeholder.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'PDF Automation | Batch Document Generator from CSV & Excel'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    title: 'Dashboard | PDF Automation',
    canActivate: [authGuard]
  },
  {
    path: 'home',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'new-automation',
    component: NewAutomationComponent,
    title: 'New PDF Automation | PDF Automation',
    canActivate: [authGuard]
  },
  {
    path: 'automation-lab/:projectId',
    component: AutomationLabComponent,
    title: 'Automation Lab | PDF Automation',
    canActivate: [authGuard]
  },
  {
    path: 'templates',
    component: WorkspacePlaceholderComponent,
    data: {
      title: 'Templates',
      emptyMessage: 'Your saved templates will appear here.'
    },
    title: 'Templates | PDF Automation',
    canActivate: [authGuard]
  },
  {
    path: 'data-sources',
    component: WorkspacePlaceholderComponent,
    data: {
      title: 'Data Sources',
      emptyMessage: 'Your added data sources will appear here.'
    },
    title: 'Data Sources | PDF Automation',
    canActivate: [authGuard]
  },
  {
    path: 'data-import',
    redirectTo: '/new-automation',
    pathMatch: 'full'
  },
  {
    path: 'template-upload',
    redirectTo: '/new-automation?step=3'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
