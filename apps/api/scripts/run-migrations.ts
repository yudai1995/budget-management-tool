import { AppDataSource } from '../src/infrastructure/persistence/data-source'

async function main() {
    const dataSource = await AppDataSource.initialize()
    try {
        const executed = await dataSource.runMigrations()
        console.log(`Executed migrations: ${executed.length}`)
        for (const m of executed) {
            console.log(`- ${m.name}`)
        }
    } finally {
        await dataSource.destroy()
    }
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

