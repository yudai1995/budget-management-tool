import { Expense } from '../models/Expense'

export interface IExpenseRepository {
    findAll(): Promise<Expense[]>
    findById(id: string): Promise<Expense | null>
    save(expense: Expense): Promise<Expense>
    remove(id: string): Promise<void>
}
