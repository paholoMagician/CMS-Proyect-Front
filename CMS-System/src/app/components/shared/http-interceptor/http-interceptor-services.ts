import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpInterceptorServices implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const url = request.url;
          const method = request.method;
          const responseSize = this.getResponseSize(event);

          console.log(`Servicio ${method} ${url} consumió ${this.bytesToMB(responseSize)} MB en ${duration} ms`);
        }
      })
    );
  }

  getResponseSize(event: HttpResponse<any>): number {
    const contentLengthHeader = event.headers.get('content-length');
    const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
    return contentLength;
  }

  bytesToMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }
}
