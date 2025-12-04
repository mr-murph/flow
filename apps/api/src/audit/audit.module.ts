import { Module, Global } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { PrismaModule } from "../prisma/prisma.module";

@Global() // Global così non dobbiamo importarlo ovunque
@Module({
  imports: [PrismaModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
