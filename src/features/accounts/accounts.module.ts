import { AccountsService } from './accounts.service';
import { Account } from './entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    providers: [AccountsService],
    exports: [AccountsService],
})
export class AccountsModule {}
