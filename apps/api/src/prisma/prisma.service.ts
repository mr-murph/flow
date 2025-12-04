import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
// @ts-ignore
import { PrismaClient } from "@prisma/client";
import { tenantLocalStorage } from "../auth/tenant.guard";

@Injectable()
// @ts-ignore
export class PrismaService extends PrismaClient implements OnModuleInit {
  [key: string]: any;

  constructor() {
    super({
      datasources: {
        db: { url: process.env.DATABASE_URL },
      },
    });
  }

  getTenantId(): string {
    const store = tenantLocalStorage.getStore();
    if (!store?.tenantId) {
      throw new Error("Tenant ID not found in PrismaService context.");
    }
    return store.tenantId;
  }

  async onModuleInit() {
    await this.$connect();
  }
}
