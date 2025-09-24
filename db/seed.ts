// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import sampleData from "./sample-data";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🧹 Clearing existing data...");

    // Delete in correct order (children → parents)
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    console.log("🌱 Inserting sample data...");

    // Insert sample products
    if (sampleData.products && sampleData.products.length > 0) {
      await prisma.product.createMany({
        data: sampleData.products,
        skipDuplicates: true, // ✅ prevents errors on re-seed
      });
    }

    // Insert sample users
    if (sampleData.users && sampleData.users.length > 0) {
      await prisma.user.createMany({
        data: sampleData.users,
        skipDuplicates: true,
      });
    }

    console.log("✅ Data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1); // exit with failure
  } finally {
    await prisma.$disconnect();
  }
}

main();
