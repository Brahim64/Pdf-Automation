import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly router = inject(Router);
  title = 'PDF Automation';

  get showSidebar(): boolean {
    const currentPath = this.router.url.split(/[?#]/, 1)[0];
    return currentPath !== '/' && currentPath !== '/login' && !this.isAutomationLabRoute(currentPath);
  }

  get showFooter(): boolean {
    const currentPath = this.router.url.split(/[?#]/, 1)[0];
    return !this.isAutomationLabRoute(currentPath);
  }

  private isAutomationLabRoute(path: string): boolean {
    return path === '/automation-lab' || path.startsWith('/automation-lab/');
  }
}
