import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const teams = [
  // Hosts
  { id: "USA", name: "United States", flagUrl: "https://flagcdn.com/us.svg" },
  { id: "MEX", name: "Mexico", flagUrl: "https://flagcdn.com/mx.svg" },
  { id: "CAN", name: "Canada", flagUrl: "https://flagcdn.com/ca.svg" },

  // UEFA (Europe)
  { id: "FRA", name: "France", flagUrl: "https://flagcdn.com/fr.svg" },
  { id: "ENG", name: "England", flagUrl: "https://flagcdn.com/gb-eng.svg" },
  { id: "ESP", name: "Spain", flagUrl: "https://flagcdn.com/es.svg" },
  { id: "GER", name: "Germany", flagUrl: "https://flagcdn.com/de.svg" },
  { id: "POR", name: "Portugal", flagUrl: "https://flagcdn.com/pt.svg" },
  { id: "ITA", name: "Italy", flagUrl: "https://flagcdn.com/it.svg" },
  { id: "BEL", name: "Belgium", flagUrl: "https://flagcdn.com/be.svg" },
  { id: "NED", name: "Netherlands", flagUrl: "https://flagcdn.com/nl.svg" },
  { id: "CRO", name: "Croatia", flagUrl: "https://flagcdn.com/hr.svg" },
  { id: "SUI", name: "Switzerland", flagUrl: "https://flagcdn.com/ch.svg" },
  { id: "DEN", name: "Denmark", flagUrl: "https://flagcdn.com/dk.svg" },
  { id: "AUT", name: "Austria", flagUrl: "https://flagcdn.com/at.svg" },
  { id: "UKR", name: "Ukraine", flagUrl: "https://flagcdn.com/ua.svg" },
  { id: "POL", name: "Poland", flagUrl: "https://flagcdn.com/pl.svg" },
  { id: "TUR", name: "Turkey", flagUrl: "https://flagcdn.com/tr.svg" },
  { id: "SWE", name: "Sweden", flagUrl: "https://flagcdn.com/se.svg" },

  // CONMEBOL (South America)
  { id: "ARG", name: "Argentina", flagUrl: "https://flagcdn.com/ar.svg" },
  { id: "BRA", name: "Brazil", flagUrl: "https://flagcdn.com/br.svg" },
  { id: "URU", name: "Uruguay", flagUrl: "https://flagcdn.com/uy.svg" },
  { id: "COL", name: "Colombia", flagUrl: "https://flagcdn.com/co.svg" },
  { id: "ECU", name: "Ecuador", flagUrl: "https://flagcdn.com/ec.svg" },
  { id: "PAR", name: "Paraguay", flagUrl: "https://flagcdn.com/py.svg" },
  { id: "CHI", name: "Chile", flagUrl: "https://flagcdn.com/cl.svg" },
  { id: "VEN", name: "Venezuela", flagUrl: "https://flagcdn.com/ve.svg" },
  { id: "PER", name: "Peru", flagUrl: "https://flagcdn.com/pe.svg" },

  // CAF (Africa)
  { id: "MAR", name: "Morocco", flagUrl: "https://flagcdn.com/ma.svg" },
  { id: "SEN", name: "Senegal", flagUrl: "https://flagcdn.com/sn.svg" },
  { id: "TUN", name: "Tunisia", flagUrl: "https://flagcdn.com/tn.svg" },
  { id: "CMR", name: "Cameroon", flagUrl: "https://flagcdn.com/cm.svg" },
  { id: "ALG", name: "Algeria", flagUrl: "https://flagcdn.com/dz.svg" },
  { id: "EGY", name: "Egypt", flagUrl: "https://flagcdn.com/eg.svg" },
  { id: "NGA", name: "Nigeria", flagUrl: "https://flagcdn.com/ng.svg" },
  { id: "GHA", name: "Ghana", flagUrl: "https://flagcdn.com/gh.svg" },
  { id: "CIV", name: "Ivory Coast", flagUrl: "https://flagcdn.com/ci.svg" },

  // AFC (Asia)
  { id: "JPN", name: "Japan", flagUrl: "https://flagcdn.com/jp.svg" },
  { id: "KOR", name: "South Korea", flagUrl: "https://flagcdn.com/kr.svg" },
  { id: "AUS", name: "Australia", flagUrl: "https://flagcdn.com/au.svg" },
  { id: "IRN", name: "Iran", flagUrl: "https://flagcdn.com/ir.svg" },
  { id: "KSA", name: "Saudi Arabia", flagUrl: "https://flagcdn.com/sa.svg" },
  { id: "QAT", name: "Qatar", flagUrl: "https://flagcdn.com/qa.svg" },
  { id: "IRQ", name: "Iraq", flagUrl: "https://flagcdn.com/iq.svg" },

  // CONCACAF (North/Central America & Caribbean)
  { id: "PAN", name: "Panama", flagUrl: "https://flagcdn.com/pa.svg" },
  { id: "CRC", name: "Costa Rica", flagUrl: "https://flagcdn.com/cr.svg" },
  { id: "JAM", name: "Jamaica", flagUrl: "https://flagcdn.com/jm.svg" },

  // OFC (Oceania)
  { id: "NZL", name: "New Zealand", flagUrl: "https://flagcdn.com/nz.svg" },
];

async function main() {
  console.log("Seeding teams...");
  for (const t of teams) {
    await prisma.team.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        flagUrl: t.flagUrl,
      },
      create: t,
    });
  }
  console.log(`Successfully seeded ${teams.length} World Cup teams.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
