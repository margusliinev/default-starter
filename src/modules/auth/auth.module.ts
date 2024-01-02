import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DrizzleModule } from 'src/modules/drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard],
    exports: [AuthGuard],
})
export class AuthModule {}
