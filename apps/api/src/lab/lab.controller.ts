import { Controller, Get, Post, Put, Body, Param, UseGuards, UseInterceptors } from "@nestjs/common";
import { LabService } from "./lab.service";
import { AuthGuard } from "@nestjs/passport";
import { AuditInterceptor } from "../audit/audit.interceptor";

@Controller("lab")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(AuditInterceptor) // Attiva il log automatico
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post("batches")
  createBatch(@Body() dto: any) {
    return this.labService.createMaterialBatch(dto);
  }

  @Get("batches")
  getBatches() {
    return this.labService.getBatches();
  }

  @Post("orders")
  createOrder(@Body() dto: any) {
    return this.labService.createOrder(dto);
  }

  @Post("orders/:id/materials")
  addMaterial(@Param("id") id: string, @Body("batchId") batchId: string) {
    return this.labService.addMaterialToOrder(id, batchId);
  }

  @Put("orders/:id/close")
  closeOrder(@Param("id") id: string) {
    return this.labService.closeOrder(id);
  }
}
