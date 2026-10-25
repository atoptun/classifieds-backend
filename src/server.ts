import env from "@/config/env.ts";
import app from "@/app.ts";
import prisma from "@/db/prisma.ts";

const server = app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});

server.on("close", () => {
  console.log("--> Express server event: 'close' emitted!");
});

server.on("error", (err) => {
  console.error("--> Express server error:", err);
});

process.on("exit", (code) => {
  console.log(`--> Process exited with code: ${code}`);
});

process.on("beforeExit", (code) => {
  console.log(`--> Event Loop is empty! Process beforeExit with code: ${code}`);
});

async function shutdown() {
  console.log("Shutting down server...");
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected. Process exited.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
