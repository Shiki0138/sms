import { seedDatabase, connectDatabase, disconnectDatabase } from '../src/database'

async function main() {
  try {
    await connectDatabase()
    await seedDatabase()
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await disconnectDatabase()
  }
}

main()