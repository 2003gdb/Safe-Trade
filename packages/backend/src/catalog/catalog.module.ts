import { Module } from '@nestjs/common';
import { CatalogRepository } from './catalog.repository';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  providers: [CatalogRepository],
  exports: [CatalogRepository]
})
export class CatalogModule {}