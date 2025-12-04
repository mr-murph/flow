import { Injectable, Logger } from "@nestjs/common";
import { Storage } from "@google-cloud/storage";
import { ConfigService } from "@nestjs/config";
import { google } from "googleapis";

@Injectable()
export class GcpStorageService {
  private storage: Storage;
  private bucketName: string;
  private readonly logger = new Logger(GcpStorageService.name);
  private projectId: string;

  constructor(private configService: ConfigService) {
    this.storage = new Storage(); // Auth automatica su Cloud Run
    this.bucketName = this.configService.getOrThrow<string>("GCP_BUCKET_NAME");
    this.projectId = this.configService.getOrThrow<string>("GCP_PROJECT_ID");
  }

  // Genera URL per upload diretto dal browser (o dal Satellite)
  async generateUploadUrl(
    fileName: string, 
    contentType: string, 
    tenantId: string
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    
    const uniqueId = crypto.randomUUID();
    const date = new Date();
    // Path: tenant_id/YYYY/UUID_filename
    const path = `${tenantId}/${date.getFullYear()}/${uniqueId}_${fileName}`;
    
    const options = {
      version: "v4" as const,
      action: "write" as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 min
      contentType: contentType,
    };

    try {
      const [url] = await this.storage
        .bucket(this.bucketName)
        .file(path)
        .getSignedUrl(options);

      return { uploadUrl: url, fileKey: path };
    } catch (error) {
      this.logger.error("Error signing URL", error);
      throw new Error("Storage config error");
    }
  }

  // Genera URL di lettura temporaneo
  async generateReadUrl(fileKey: string): Promise<string> {
    const options = {
      version: "v4" as const,
      action: "read" as const,
      expires: Date.now() + 60 * 60 * 1000, // 1 ora
    };
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(fileKey)
      .getSignedUrl(options);
    return url;
  }

  async importDicomInstance(gcsUri: string) {
    // 1. Autenticazione con le credenziali di default (Cloud Run Service Account)
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    
    const healthcare = google.healthcare({ version: "v1", auth });

    // Sostituisci con i tuoi ID reali o prendili da env
    const parent = `projects/${this.projectId}/locations/us-central1/datasets/dental-dataset/dicomStores/dental-dicom-store`;

    try {
      this.logger.log(`Importing DICOM from ${gcsUri} to ${parent}`);
      
      await healthcare.projects.locations.datasets.dicomStores.import({
        name: parent,
        requestBody: {
          gcsSource: {
            uri: `gs://${this.bucketName}/${gcsUri}` // Costruisci il path completo gs://...
          }
        }
      });
      
      this.logger.log("DICOM import triggered successfully");
    } catch (error) {
      this.logger.error("Failed to import DICOM", error);
      // Non bloccare l\"upload utente se l\"import PACS fallisce, ma logga l\"errore
    }
  }
}
