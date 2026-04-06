import { Budget } from '../models/Budget'

export interface IBudgetRepository {
    all(): Promise<Budget[]>
    one(id: string): Promise<Budget | null>
    save(budget: any): Promise<Budget>
    remove(id: string): Promise<any>
}

