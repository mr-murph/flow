import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { tenantLocalStorage } from '../auth/tenant.guard'; // Import AsyncLocalStorage
import { CreatePatientDto } from '@repo/dto'; // Assuming DTOs will be in @repo/dto

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  private get tenantId(): string {
    const store = tenantLocalStorage.getStore();
    if (!store?.tenantId) {
      throw new Error("Tenant ID not found in context.");
    }
    return store.tenantId;
  }

  create(createPatientDto: CreatePatientDto) {
    const patientData = {
      ...createPatientDto,
      cf: createPatientDto.cf || '', // Ensure 'cf' is always a string
      tenantId: this.tenantId,
    };
    // @ts-ignore
    return this.prisma.patient.create({
      data: patientData,
    });
  }

  findAll() {
    // @ts-ignore
    return this.prisma.patient.findMany({
      where: { tenantId: this.tenantId },
    });
  }

  findOne(id: string) {
    // @ts-ignore
    return this.prisma.patient.findUnique({
      where: { id, tenantId: this.tenantId },
    });
  }

  update(id: string, updatePatientDto: any) {
    // @ts-ignore
    return this.prisma.patient.update({
      where: { id, tenantId: this.tenantId },
      data: updatePatientDto,
    });
  }

  remove(id: string) {
    // @ts-ignore
    return this.prisma.patient.delete({
      where: { id, tenantId: this.tenantId },
    });
  }

  getFiles(patientId: string) {
    // @ts-ignore
    return this.prisma.medicalFile.findMany({
      where: { patientId, tenantId: this.tenantId },
    });
  }
}
