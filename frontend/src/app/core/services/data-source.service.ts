import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';
import { DataSourceResponse } from '../../models/data-source.model';

@Injectable({ providedIn: 'root' })
export class DataSourceService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly dataSourcesUrl = `${environment.apiBaseUrl}/data-sources`;

  upload(file: File, projectId: string): Observable<DataSourceResponse> {
    if (!projectId) {
      return throwError(() => new Error('Create a project before uploading a data source.'));
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('projectId', projectId);

    return this.withAuth((headers) =>
      this.http.post<DataSourceResponse>(this.dataSourcesUrl, formData, { headers })
    );
  }

  getAll(projectId?: string): Observable<DataSourceResponse[]> {
    const params = projectId ? new HttpParams().set('projectId', projectId) : undefined;
    return this.withAuth((headers) =>
      this.http.get<DataSourceResponse[]>(this.dataSourcesUrl, { headers, params })
    );
  }

  getById(id: string): Observable<DataSourceResponse> {
    return this.withAuth((headers) =>
      this.http.get<DataSourceResponse>(`${this.dataSourcesUrl}/${encodeURIComponent(id)}`, { headers })
    );
  }

  getColumns(id: string): Observable<string[]> {
    return this.withAuth((headers) =>
      this.http.get<string[]>(`${this.dataSourcesUrl}/${encodeURIComponent(id)}/columns`, { headers })
    );
  }

  download(id: string): Observable<Blob> {
    return this.withAuth((headers) =>
      this.http.get(`${this.dataSourcesUrl}/${encodeURIComponent(id)}/download`, {
        headers,
        responseType: 'blob'
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.withAuth((headers) =>
      this.http.delete<void>(`${this.dataSourcesUrl}/${encodeURIComponent(id)}`, { headers })
    );
  }

  private withAuth<T>(request: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    const token = this.auth.getToken();
    if (!token) {
      return throwError(() => new Error('Sign in before managing data sources.'));
    }

    return request(new HttpHeaders({ Authorization: 'Bearer ' + token }));
  }
}
