import { query } from '../db/index.js';

const getAllUsers = async (req, res) => {
    const data = await query('select * from postgrestable');
    if (!data) {
        throw new Error('500 Internal Server Error');
    }
    res.status(200).json({ data });
};

const createUser = async (req, res) => {
    const data = await query('insert into postgrestable (name, age, job) values ($1, $2, $3) returning *', [req.body.name, req.body.age, req.body.job]);
    if (!data) {
        throw new Error('500 Internal Server Error');
    }
    res.status(201).json({ data });
};

export { getAllUsers, createUser };
