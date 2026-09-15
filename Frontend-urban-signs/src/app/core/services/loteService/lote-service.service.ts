import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment'
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoteServiceService {
  private apiUrl = `${environment.API_URL}/api/lotes`;

  private http = inject(HttpClient);

  getLotes(idMaterial: number) {
    return this.http.get<any>(`${this.apiUrl}/material/${idMaterial}`, { withCredentials: true });
  }
}
