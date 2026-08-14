import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { InspectorBridgePayload } from '../models/inspector.model';

export interface BridgeResponse {
  success: boolean;
  message?: string;
  path?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InspectorBridgeService {
  private readonly http = inject(HttpClient);
  private readonly bridgeUrl = 'http://localhost:4300/api/changes';

  /**
   * Envia o payload de alterações de estilo para o servidor ponte local (server.js na porta 4300).
   */
  public sendChanges(payload: InspectorBridgePayload): Observable<BridgeResponse> {
    return this.http.post<BridgeResponse>(this.bridgeUrl, payload).pipe(
      catchError(error => {
        console.error('[InspectorBridgeService] Falha na comunicação com o servidor ponte:', error);
        return throwError(() => new Error('Não foi possível conectar ao servidor ponte local na porta 4300! Certifique-se de iniciar o servidor com "node server.js".'));
      })
    );
  }
}
