
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { CatalogMappingService } from './catalog-mapping.service';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService, AdminRepository, CatalogMappingService],
  exports: [AdminService, CatalogMappingService],
})
export class AdminModule {}