import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: true,
});

const query = async <T extends QueryResultRow>(text: string, params?: string[]): Promise<T[]> => {
    const client = await pool.connect();
    try {
        const result: QueryResult<T> = await client.query(text, params);
        return result.rows;
    } finally {
        client.release();
    }
};

export { query };
