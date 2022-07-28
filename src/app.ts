import 'reflect-metadata';
import cors from 'cors';
import express from 'express';
import router from './routes/router';

require('dotenv').config();

const app = express();
app.disable('x-powered-by');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb' }));

app.use(router);
app.use(cors());

export default app;
