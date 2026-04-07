import type { BalanceType } from './expense'

export interface BudgetProps {
    id: string
    amount: number
    balanceType: BalanceType
    userId: string
    categoryId: number
    content: string | null
    date: string
    createdDate: Date
    updatedDate: Date
    deletedDate: Date | null
}
