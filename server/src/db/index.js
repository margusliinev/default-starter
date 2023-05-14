import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
});

const query = async (text, params) => {
    const client = await pool.connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } catch (error) {
        console.log(error);
    } finally {
        client.release();
    }
};

export { query };
