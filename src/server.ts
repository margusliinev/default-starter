import 'express-async-errors';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import { globalErrorHandler, notFoundHandler } from './middleware/errorHandlerMiddleware';
import userRoutes from './routes/userRoutes';
import { limiter } from './utils/limiter';

dotenv.config();
const app = express();

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(limiter);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use('/', userRoutes);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
}

app.use(notFoundHandler);
app.use(globalErrorHandler);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server is listening on port ${port}`));
