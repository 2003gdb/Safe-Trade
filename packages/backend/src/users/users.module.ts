
import { Module, forwardRef } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UsersRepository } from "./users.repository";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [forwardRef(() => AuthModule)], // Use forwardRef to avoid circular dependency
    controllers: [UsersController],
    providers: [UsersService, UsersRepository],
    exports: [UsersService, UsersRepository], // Export for admin module reuse
})
export class UsersModule {}