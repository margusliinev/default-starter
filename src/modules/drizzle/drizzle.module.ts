import { Module } from '@nestjs/common';
import { DrizzleProvider } from './drizzle.provider';

@Module({
    providers: [DrizzleProvider],
    exports: [DrizzleProvider],
})
export class DrizzleModule {}
