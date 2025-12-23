const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const ownerEmail = "owner@demo.local";
  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: { email: ownerEmail, name: "Demo Owner" }
  });

  let workspace = await prisma.workspace.findFirst({
    where: { name: "Default Workspace", ownerUserId: owner.id }
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: "Default Workspace", ownerUserId: owner.id }
    });
  }

  const existingProject = await prisma.project.findFirst({
    where: { name: "Demo Project", workspaceId: workspace.id }
  });

  if (!existingProject) {
    await prisma.project.create({
      data: {
        name: "Demo Project",
        domain: "example.com",
        localeCountry: "US",
        localeLanguage: "en",
        workspaceId: workspace.id
      }
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
