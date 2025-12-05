import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Account } from '../features/accounts/entities/account.entity';
import { Session } from '../features/sessions/entities/session.entity';
import { User } from '../features/users/entities/user.entity';
import { config } from './env';

dotenv.config();

const envConfig = config();

export default new DataSource({
    type: 'postgres',
    host: envConfig.database.host,
    port: envConfig.database.port,
    username: envConfig.database.username,
    password: envConfig.database.password,
    database: envConfig.database.database,
    entities: [User, Account, Session],
    migrations: ['migrations/*.ts'],
    migrationsTableName: 'migrations',
});
