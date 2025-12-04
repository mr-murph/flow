import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GcpStorageService } from "../storage/gcp-storage.service";

@Injectable()
export class ConsentsService {
  constructor(
    private prisma: PrismaService,
    private storageService: GcpStorageService
  ) {}

  async createTemplate(title: string, content: string) {
    const tenantId = this.prisma.getTenantId();
    // @ts-ignore
    return this.prisma.consentTemplate.create({
      data: {
        title,
        content,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async getTemplates() {
    const tenantId = this.prisma.getTenantId();
    // @ts-ignore
    return this.prisma.consentTemplate.findMany({
      where: { tenantId },
    });
  }

  async generateConsent(patientId: string, templateId: string) {
    const tenantId = this.prisma.getTenantId();
    
    // @ts-ignore
    const patient = await this.prisma.patient.findUnique({
        where: { id: patientId, tenantId }
    });
    if (!patient) throw new NotFoundException("Patient not found");

    // @ts-ignore
    const template = await this.prisma.consentTemplate.findUnique({
        where: { id: templateId, tenantId }
    });
    if (!template) throw new NotFoundException("Template not found");

    // Mock PDF Generation
    // In production: Use pdf-lib to merge fields
    const fileName = `consent_${patientId}_${templateId}_${Date.now()}.pdf`;
    const fileKey = `${tenantId}/consents/${fileName}`;
    
    // Mock Upload (We assume it succeeded)
    const signedPdfUrl = `gs://bucket/${fileKey}`;

    // @ts-ignore
    const consent = await this.prisma.signedConsent.create({
        data: {
            patient: { connect: { id: patientId } },
            template: { connect: { id: templateId } },
            signedPdfUrl: signedPdfUrl,
            signatureHash: "pending-signature", // Placeholder
        }
    });
    
    return consent;
  }
}
