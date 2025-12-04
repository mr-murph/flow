import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuditService } from "./audit.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, user, body } = req;

    // Ignoriamo le richieste di lettura (GET) per non intasare il DB
    // GDPR richiede log forti principalmente su Modifica/Cancellazione
    if (method === "GET" || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        // Questa funzione viene eseguita DOPO che il controller ha risposto con successo
        const resource = url.split("/")[1] || "unknown"; // es. /patients -> "patients"
        
        // Sanitizziamo il body per non loggare password o dati troppo pesanti
        const { password, ...cleanBody } = body || {};

        this.auditService.logAction({
          userId: user.userId,
          tenantId: user.tenantId,
          action: method, // POST, PUT, DELETE
          resource: resource,
          details: cleanBody,
        });
        
        this.logger.log(`Audit: ${user.email} ${method} ${url}`);
      }),
    );
  }
}
