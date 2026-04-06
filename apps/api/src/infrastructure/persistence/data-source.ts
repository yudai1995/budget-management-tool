import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as path from 'node:path'
import { Budget } from '../../domain/models/Budget'
import { User } from '../../domain/models/User'
import { ExpenseDataModel } from './entity/ExpenseDataModel'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOSTNAME || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || process.env.DB_USERNAME || 'Admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'budgetdb',
    synchronize: false,
    logging: true,
    entities: [Budget, User, ExpenseDataModel],
    migrations: [path.join(__dirname, 'migrations', '**/*{.ts,.js}')],
    migrationsTableName: 'migrations',
    subscribers: [],
})
