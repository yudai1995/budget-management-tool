import type { Budget } from '../models/Budget';

export interface IBudgetRepository {
    all(): Promise<Budget[]>;
    one(id: string): Promise<Budget | null>;
    save(budget: unknown): Promise<Budget>;
    remove(id: string): Promise<void>;
}
