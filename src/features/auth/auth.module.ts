import { AccountsModule } from '../accounts/accounts.module';
import { SessionsModule } from '../sessions/sessions.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { OAuthService } from './oauth.service';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Module } from '@nestjs/common';

@Module({
    imports: [UsersModule, SessionsModule, AccountsModule],
    controllers: [AuthController],
    providers: [AuthService, AuthGuard, OAuthService],
    exports: [AuthService, AuthGuard],
})
export class AuthModule {}
