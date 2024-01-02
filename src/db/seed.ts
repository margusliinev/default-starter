import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { usersTable } from './schema';
import mockUsers from './users.json';
import bcrypt from 'bcryptjs';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(client, { schema });

async function seed() {
    await client.connect();
    await db.delete(usersTable);
    for (const user of mockUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await db
            .insert(usersTable)
            .values({
                username: user.username,
                email: user.email,
                password: hashedPassword,
                photo: user.photo,
            })
            .returning();
    }
    await client.end();
}

seed().catch((error) => {
    console.error(error);
    process.exit(1);
});
