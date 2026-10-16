import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ADVISORS_SEED, DOSSIER_SEED } from "./advisors-seed";
import { advisors, dossierSections } from "./schema";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL не задан");
  const client = postgres(url, { prepare: false, max: 1 });
  const db = drizzle(client);
  // Повторный запуск безопасен: существующие записи (и ваши правки) не перезаписываются
  await db.insert(advisors).values(ADVISORS_SEED).onConflictDoNothing({ target: advisors.slug });
  await db.insert(dossierSections).values(DOSSIER_SEED).onConflictDoNothing({ target: dossierSections.key });
  await client.end();
  console.log(`Советники: ${ADVISORS_SEED.length}, разделы досье: ${DOSSIER_SEED.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
