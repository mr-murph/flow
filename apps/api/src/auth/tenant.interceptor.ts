import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantLocalStorage } from './tenant.guard';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.tenantId) {
      return new Observable((observer) => {
        tenantLocalStorage.run({ tenantId: user.tenantId }, async () => {
          const subscription = next.handle().subscribe({
            next: (val) => observer.next(val),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
          return () => subscription.unsubscribe();
        });
      });
    }

    return next.handle();
  }
}
