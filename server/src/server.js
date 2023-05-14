import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import users from './routes/index.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use('/', users);
app.use(errorHandler);
app.use(notFound);

app.listen(port, console.log(`Server is listening on port ${port}`));
