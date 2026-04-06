import { AppDataSource } from '../src/infrastructure/persistence/data-source'

async function main() {
    const dataSource = await AppDataSource.initialize()
    try {
        await dataSource.undoLastMigration()
        console.log('Reverted last migration')
    } finally {
        await dataSource.destroy()
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

