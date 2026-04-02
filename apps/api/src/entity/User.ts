import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm'
import { Budget } from './Budget'

@Entity({
    name: 'user_list',
})
export class User {
    @PrimaryColumn({ type: 'varchar', length: 255, name: 'userId' })
    userId: string

    @Column({ type: 'varchar', length: 255, name: 'userName' })
    userName: string

    @Column({ type: 'varchar', length: 255, name: 'password' })
    password: string

    @OneToMany(() => Budget, (budget) => budget.user)
    budgets: Budget[]
}
