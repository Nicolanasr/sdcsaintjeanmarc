const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    await prisma.quest.deleteMany({
        where: { title: "Operation Black-Box" }
    });

    const quest = await prisma.quest.create({
        data: {
            title: "Operation Black-Box",
            description: `🚨 **SYSTEM INTEGRITY BREACH: CODE BLACK-BOX** 🚨

\`[SYS_LOG: ENCRYPTION_LEVEL_MAX]\`
\`[CONTEXT_MASK: ACTIVE]\`

\`ALPHA_SIGMA\`: A prominent terrain grid from a massive, multi-generational milestone gathering hosted within the past 12 months.
\`BETA_SIGMA\`: A separate, frozen stone sanctuary from our troop operations within the past 12 months.

\`VECTOR_DELTA\`: The precise straight-line distance between ALPHA_SIGMA and BETA_SIGMA, measured strictly in kilometers.

* *Note on Vector Resolution:* This value must be rounded to the nearest whole integer using standard truncation rules (e.g., 1.1 becomes 1; 1.5 becomes 1; 1.8 becomes 2).

\`TERMINAL_DECRYPT_KEY\`: \`(VECTOR_DELTA * OFFICIAL_FOJ_REGISTRY_COUNT) + Freeze_Duration_Days\`
OFFICIAL_FOJ_REGISTRY_COUNT: This refers to the absolute total number of officially registered active members across all sections of our scout group (Foj) for the current year cycle.
Freeze_Duration_Days: This represents the exact chronological duration of our BETA_SIGMA operation held within the past 12 months.

**Data Submission Protocols:**

* Each individual Rover is permitted a maximum of **2 submissions total**.
* The terminal is operating on a blind-intake matrix: **you will not be notified if your submission is correct or incorrect** when you hit enter.
* The system grid will process all logs simultaneously and reveal the final results at exactly midnight.

The terminal closes at 12:00 PM tonight. Coordinate the history tracking, isolate the variables, and lock in your calculations.

\`[EOF]\``,
            clueHint: "ALPHA_SIGMA is Skylight Village in Jaj (from the Scout Family Day), and BETA_SIGMA is Deir El Qattarah (from the Winter Camp). The straight distance between them rounds perfectly to 1 km. Multiply 1 by the exact number of officially registered members in our entire Foj, then add the number of days the winter camp lasted.",
            verificationType: "DIGITAL_CODE",
            creditReward: 150,
            isReleased: true,
            isBlind: true,
            unlockedAtDate: new Date(),
            phase: "LIVE_CAMP"
        }
    });

    console.log("Operation Black-Box Quest created successfully:", quest);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await pool.end();
        await prisma.$disconnect();
    });
