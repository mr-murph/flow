import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: {
    userId: string;
    tenantId: string;
    action: string;
    resource: string;
    details?: any;
  }) {
    // Scrive il log in modo asincrono (fire-and-forget) per non rallentare l\'utente
    // In produzione, questo potrebbe andare su una coda (es. Pub/Sub)
    this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        tenantId: data.tenantId,
        action: data.action,
        resource: data.resource,
        details: data.details ? JSON.stringify(data.details) : undefined,
      },
    }).catch((err: any) => console.error('Audit Log failed:', err));
  }
}
