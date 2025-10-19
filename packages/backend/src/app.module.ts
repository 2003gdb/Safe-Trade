import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EnvValidationService } from './common/config/env-validation.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ReportesModule } from './reportes/reportes.module';
import { ComunidadModule } from './comunidad/comunidad.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    UsersModule,
    AuthModule,
    AdminModule,
    ReportesModule,
    ComunidadModule,
    JwtModule.register({
      global: true,
      secret: EnvValidationService.getJwtSecret(),
    }),
  ]
})
export class AppModule {}