import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Budget } from './entity/Budget'
import { User } from './entity/User'

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'Admin',
    password: 'wertyu89?',
    database: 'budgetdb',
    synchronize: true,
    logging: false,
    entities: [Budget, User],
    migrations: [],
    subscribers: [],
})
