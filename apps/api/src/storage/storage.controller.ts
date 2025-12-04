import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GcpStorageService } from "./gcp-storage.service";
import type { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import type { ConfirmUploadDto } from "@repo/dto";

interface SignedUrlRequest {
  fileName: string;
  contentType: string;
}

@UseGuards(AuthGuard("jwt"))
@Controller("storage")
export class StorageController {
  constructor(
    private readonly gcpStorageService: GcpStorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post("sign-upload")
  async signUpload(@Body() data: SignedUrlRequest, @Req() req: Request) {
    const tenantId = req.user!["tenantId"];
    if (!tenantId) {
      throw new Error("Tenant ID not found in request.");
    }
    return this.gcpStorageService.generateUploadUrl(data.fileName, data.contentType, tenantId);
  }

  @Post("confirm-upload")
  async confirmUpload(@Body() data: ConfirmUploadDto, @Req() req: Request) {
    const tenantId = req.user!["tenantId"];
    if (!tenantId) {
      throw new Error("Tenant ID not found in request.");
    }
    
    // Create or update MedicalFile entry
    // For now, we\"ll just create a new one. In Phase 4, we\"ll enhance this.
    // @ts-ignore
    const medicalFile = await this.prisma.medicalFile.create({
      data: {
        fileName: data.fileName,
        s3Key: data.fileKey,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        uploadedBy: req.user!.email,
        patient: { connect: { id: data.patientId } },
        tenant: { connect: { id: tenantId } },
      },
    });

    // If it\"s a DICOM file, trigger import to Healthcare API
    if (data.mimeType === "application/dicom") {
      await this.gcpStorageService.importDicomInstance(data.fileKey);
    }

    return medicalFile;
  }

  @Post("sign-download")
  async signDownload(@Body() data: { fileKey: string }, @Req() req: Request) {
    const tenantId = req.user!["tenantId"];
    if (!tenantId) {
      throw new Error("Tenant ID not found in request.");
    }
    
    if (!data.fileKey.startsWith(tenantId)) {
      throw new Error("Access denied to this file.");
    }

    const url = await this.gcpStorageService.generateReadUrl(data.fileKey);
    return { downloadUrl: url };
  }
}
