import { Module } from '@nestjs/common';
import { GcpStorageService } from './gcp-storage.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [GcpStorageService],
  exports: [GcpStorageService],
})
export class StorageModule {}
