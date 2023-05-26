import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import notFoundMiddleware from './middleware/notFound';
import errorHandlerMiddleware from './middleware/errorHandler';
import Router from './routes';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/', Router);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is listening on port ${port}`));
