import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LabService {
  constructor(private prisma: PrismaService) {}

  // --- GESTIONE LOTTI (Magazzino) ---
  
  async createMaterialBatch(dto: any) { // Usa DTO tipizzato in prod
    return this.prisma.materialBatch.create({
      data: {
        name: dto.name,
        // manufacturer: dto.manufacturer, // Removed: Not in schema
        batchCode: dto.batchNumber, // Mapped to batchCode
        quantity: dto.quantity || 0, // Added: required by schema
        expirationDate: new Date(dto.expiryDate), // Mapped to expirationDate
        tenant: { connect: { id: this.prisma.getTenantId() } }
      }
    });
  }

  async getBatches() {
    return this.prisma.materialBatch.findMany({
      where: { tenantId: this.prisma.getTenantId() },
      orderBy: { expirationDate: "asc" }
    });
  }

  // --- GESTIONE ORDINI (Prescrizioni) ---

  async createOrder(dto: any) {
    return this.prisma.labOrder.create({
      data: {
        status: "PENDING",
        description: dto.prescription, // Mapped to description
        deliveryDate: new Date(dto.deliveryDate),
        patient: { connect: { id: dto.patientId } },
        tenant: { connect: { id: this.prisma.getTenantId() } },
        // Se è uno studio che invia a un lab esterno, qui collegheremmo il labId
      }
    });
  }

  async addMaterialToOrder(orderId: string, batchId: string) {
    // Collega un lotto a un ordine (\"Ho usato 2g di Ceramica X per questo dente\")
    return this.prisma.usedMaterial.create({
      data: {
        labOrder: { connect: { id: orderId } },
        materialBatch: { connect: { id: batchId } },
        quantityUsed: 1 // Semplificato per ora
      }
    });
  }

  // --- LOGICA CRITICA MDR ---
  async closeOrder(orderId: string) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id: orderId },
      include: { usedMaterials: true }
    });

    if (!order) throw new NotFoundException("Ordine non trovato");

    // BLOCCO LOGICO: Non puoi chiudere se non hai tracciato i materiali
    if (order.usedMaterials.length === 0) {
      throw new BadRequestException(
        "VIOLAZIONE MDR: Impossibile chiudere il lavoro. Nessun lotto di materiale associato."
      );
    }

    return this.prisma.labOrder.update({
      where: { id: orderId },
      data: { status: "COMPLETED" } // Qui si triggererebbe la generazione PDF
    });
  }
}
