import { DataSource } from 'typeorm';
import { config } from './env';
import * as dotenv from 'dotenv';

dotenv.config();
const envConfig = config();

export default new DataSource({
    type: 'postgres',
    useUTC: true,
    port: envConfig.database.port,
    host: envConfig.database.host,
    database: envConfig.database.name,
    username: envConfig.database.username,
    password: envConfig.database.password,
    migrations: ['db/migrations/*{.js,.ts}'],
    migrationsTableName: 'migrations',
    poolSize: 1,
});
