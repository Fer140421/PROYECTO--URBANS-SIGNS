import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../models/category/category.model';
import { environment } from '../../../../environments/environment'
import { PageResponse } from '../../models/pageable/page-response.model';
import { CategorySimpleDTO } from '../../models/category/CategorySimpleDTO.model';
import { TRANSACTION_MESSAGE } from '../../interceptors/transaction.interceptor';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = `${environment.API_URL}/category`;

  constructor(private http: HttpClient) { }

  registrarCategoria(categoria: any): Observable<Category> {
    return this.http.post<Category>(
      `${this.apiUrl}/register-cat`,
      categoria,
      { withCredentials: true, context: new HttpContext().set(TRANSACTION_MESSAGE, 'Registrando categoría...') }
    );
  }

  modificarCategoria(id: number, categoria: any): Observable<Category> {
    return this.http.put<Category>(
      `${this.apiUrl}/mod-cat/${id}`,
      categoria,
      { withCredentials: true, context: new HttpContext().set(TRANSACTION_MESSAGE, 'Guardando cambios de la categoría...') }
    );
  }

  listarCategorias(
    nombre?: string,
    estado: 'true' | 'false' | 'todos' = 'todos',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<Category>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('estado', estado);

    if (nombre && nombre.trim() !== '') {
      params = params.set('nombre', nombre.trim());
    }

    return this.http.get<PageResponse<Category>>(
      `${this.apiUrl}/listCategory`,
      { params, withCredentials: true }
    );
  }

  eliminarCategoria(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/Del-cat/${id}`,
      {
        responseType: 'text',
        withCredentials: true,
        context: new HttpContext().set(TRANSACTION_MESSAGE, 'Eliminando categoría...')
      }
    );
  }

  getSimpleCategories(): Observable<CategorySimpleDTO[]> {
    return this.http.get<CategorySimpleDTO[]>(`${this.apiUrl}/categories-simple`, { withCredentials: true });
  }

  verificarMaterialesEnCategoria(id: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/check-materials/${id}`,
      { withCredentials: true }
    );
  }

  reasignarMateriales(categoryId: number, nuevaCategoriaId: number): Observable<any> {
    const context = new HttpContext().set(TRANSACTION_MESSAGE, 'Reasignando materiales...');
    return this.http.put(
      `${this.apiUrl}/reassign-materials/${categoryId}`,
      { nuevaCategoriaId },
      { withCredentials: true, context }
    );
  }
}
