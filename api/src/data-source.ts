import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Budget } from './entity/Budget';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOSTNAME,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [Budget],
  migrations: [],
  subscribers: [],
});
