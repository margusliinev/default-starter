import 'express-async-errors';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import errorHandlerMiddleware from './middleware/errorHandler';
import notFoundMiddleware from './middleware/notFound';
import testRouter from './routes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', optionsSuccessStatus: 200, credentials: true }));
app.use('/', testRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is listening on port ${port}`));
