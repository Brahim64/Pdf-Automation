import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import {
  CreateProjectRequest,
  ProjectResponse,
  UpdateProjectRequest
} from '../../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly projectsUrl = `${environment.apiBaseUrl}/projects`;

  getProjects(): Observable<ProjectResponse[]> {
    return this.request<ProjectResponse[]>('GET', this.projectsUrl);
  }

  getProject(id: string): Observable<ProjectResponse> {
    return this.request<ProjectResponse>('GET', `${this.projectsUrl}/${encodeURIComponent(id)}`);
  }

  createProject(request: CreateProjectRequest): Observable<ProjectResponse> {
    return this.request<ProjectResponse>('POST', this.projectsUrl, request);
  }

  updateProject(id: string, request: UpdateProjectRequest): Observable<ProjectResponse> {
    return this.request<ProjectResponse>('PUT', `${this.projectsUrl}/${encodeURIComponent(id)}`, request);
  }

  deleteProject(id: string): Observable<void> {
    return this.request<void>('DELETE', `${this.projectsUrl}/${encodeURIComponent(id)}`);
  }

  private request<T>(method: string, url: string, body?: unknown): Observable<T> {
    const token = this.auth.getToken();
    if (!token) {
      return throwError(() => new Error('Sign in before managing projects.'));
    }

    return this.http.request<T>(method, url, {
      body,
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}
