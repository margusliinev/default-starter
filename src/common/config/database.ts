import { Account } from '../../features/accounts/entities/account.entity';
import { Session } from '../../features/sessions/entities/session.entity';
import { User } from '../../features/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { config } from './env';
import * as dotenv from 'dotenv';

dotenv.config();

const envConfig = config();

export default new DataSource({
    type: 'postgres',
    url: envConfig.database.url,
    entities: [User, Account, Session],
    migrations: ['db/*{.js,.ts}'],
    migrationsTableName: 'migrations',
});
