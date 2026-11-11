import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { TemplateResponse } from '../../models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly templatesUrl = `${environment.apiBaseUrl}/templates`;

  getAll(projectId: string): Observable<TemplateResponse[]> {
    const params = new HttpParams().set('projectId', projectId);
    return this.withAuth((headers) =>
      this.http.get<TemplateResponse[]>(this.templatesUrl, { headers, params })
    );
  }

  download(id: string): Observable<Blob> {
    return this.withAuth((headers) =>
      this.http.get(`${this.templatesUrl}/${encodeURIComponent(id)}/download`, {
        headers,
        responseType: 'blob'
      })
    );
  }

  private withAuth<T>(request: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    const token = this.auth.getToken();
    if (!token) {
      return throwError(() => new Error('Sign in before managing templates.'));
    }

    return request(new HttpHeaders({ Authorization: 'Bearer ' + token }));
  }
}
