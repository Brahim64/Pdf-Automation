import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  uploadTemplate(file: File, projectId: string): Observable<unknown> {
    return this.upload(file, projectId, 'templates');
  }

  private upload(file: File, projectId: string, endpoint: string): Observable<unknown> {
    const token = this.auth.getToken();
    if (!token) {
      return throwError(() => new Error('Sign in before uploading a template.'));
    }
    if (!projectId) {
      return throwError(() => new Error('Create a project before uploading a template.'));
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('projectId', projectId);

    return this.http.post<unknown>(`${environment.apiBaseUrl}/${endpoint}`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}
