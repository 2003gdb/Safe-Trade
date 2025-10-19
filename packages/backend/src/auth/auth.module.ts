
import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AdminRepository } from './admin.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [forwardRef(() => UsersModule)], // Use forwardRef to avoid circular dependency
  controllers: [AuthController],
  providers: [AuthService, TokenService, AdminRepository],
  exports: [AuthService, TokenService], // Export for other modules
})
export class AuthModule {}