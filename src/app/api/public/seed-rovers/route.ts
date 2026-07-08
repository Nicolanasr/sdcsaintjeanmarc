import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { Faction, QuestPhase, ShopItemType, VerificationType } from "@prisma/client";

function hashAnswer(answer: string): string {
  return createHash("sha256").update(answer.trim().toLowerCase()).digest("hex");
}

export async function GET() {
  try {
    // 0. Clean old seeded data to prevent duplicate keys
    await prisma.questCompletion.deleteMany({});
    await prisma.shopItem.deleteMany({});
    await prisma.geoNode.deleteMany({});
    await prisma.quest.deleteMany({});

    // 1. Quests Seeding (Scouts des Cèdres Advancements)
    const questsData = [
      {
        title: "The Constitutional Firewall",
        description: "Read through the official materials on the Lebanese System of Government and Constitution. Complete an automated 10-question cyber-quiz on the site regarding the branches of government and the history of the Lebanese flag. Learning Outcome: Knowledge of the Lebanese government system and modern flag history.",
        clueHint: "The answer code to unlock this quest is 'cedar_constitution_1926'",
        verificationType: VerificationType.DIGITAL_CODE,
        encryptedAnswerHash: hashAnswer("cedar_constitution_1926"),
        creditReward: 100,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-08T00:00:00Z"),
        phase: QuestPhase.PRE_CAMP,
      },
      {
        title: "The Core Logistical Loadout",
        description: "Perform a digital submission showing an itemized weight checklist for personal gear. The pack must strictly account for a personal first-aid box containing essential tools for basic emergency care. Learning Outcome: Basic first-aid kit assembly and camp preparation.",
        clueHint: "Prepare your medical kit and present it to the Leader for review.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 100,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-08T00:00:00Z"),
        phase: QuestPhase.PRE_CAMP,
      },
      {
        title: "The Founders Intercept",
        description: "Trace a hidden text string detailing the history of scouting globally, regionally, and the founding of Scouts des Cèdres. Correctly piece together chronological events to form an alphanumeric unlock code. Learning Outcome: History of the global, Arab, and Lebanese scouting movements.",
        clueHint: "The secret code is 'cedars_scouting_history_1912'",
        verificationType: VerificationType.DIGITAL_CODE,
        encryptedAnswerHash: hashAnswer("cedars_scouting_history_1912"),
        creditReward: 150,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-11T00:00:00Z"),
        phase: QuestPhase.PRE_CAMP,
      },
      {
        title: "The Blind-Tie Rigging",
        description: "Tie the required candidate knots cleanly while blindfolded: Square knot (المربعة), Sheet bend (التوصيلية), Clove hitch (الوتد), Timber hitch (الحطاب), and Bowline (الخلبة). Learning Outcome: Mastery of core candidate knots.",
        clueHint: "Perform the blind knot tie in front of a Leader for validation.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 150,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-11T00:00:00Z"),
        phase: QuestPhase.PRE_CAMP,
      },
      {
        title: "The Tactical Perimeter Gateway",
        description: "As a team, design and construct the formal camp entranceway using advanced pioneering lashings. The Twist: It must strictly incorporate an advanced bridge or tower structure blueprint modeled and drawn by the team prior to assembly. Learning Outcome: Designing, sketching, and executing bridges, towers, and camp gateways.",
        clueHint: "Bring your design drawing to the Command Tent first.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 300,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-16T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
      {
        title: "Cartography Breakdown",
        description: "Analyze a physical topographic map of the Jaj wilderness area. Identify specific land features based strictly on standard mapping symbols and input the correct technical map terms into the terminal. Learning Outcome: Reading maps, signs, and topographic symbols.",
        clueHint: "Passcode code is 'topographic_jaj_contour'",
        verificationType: VerificationType.DIGITAL_CODE,
        encryptedAnswerHash: hashAnswer("topographic_jaj_contour"),
        creditReward: 200,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-16T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
      {
        title: "The Mass Casualty Override",
        description: "A high-pressure, unannounced simulation. Teams encounter victims presenting severe arterial bleeding, fractures, shock, and heatstroke. They must perform artificial respiration proxies, properly dress wounds, treat for shock, and safely transport the patients. Learning Outcome: Advanced wilderness first aid (Bleeding, fractures, heatstroke, shock, and artificial respiration).",
        clueHint: "Listen out for the emergency horn signal in camp.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 350,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-18T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
      {
        title: "Incident Suppression Protocol",
        description: "Demonstrate proper deployment techniques for extinguishing different classifications of fires (forest, liquid, electrical, and wood) using correct safety blankets or local tools. Learning Outcome: Firefighting protocols for forest, liquid, chemical, and electrical fires.",
        clueHint: "Present yourself at the fire circle for testing.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 200,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-18T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
      {
        title: "The Helios Primitive Kitchen",
        description: "Build a specialized outdoor stove (such as a trench or reflector stove) using natural camp elements and prepare a complete, fully cooked meal over it without modern gas appliances. Learning Outcome: Constructing various camp stoves and wilderness cooking.",
        clueHint: "Have your finished dish inspected by a Leader.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 250,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-21T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
      {
        title: "Signal Purification",
        description: "Using muddy or contaminated surface water sourced near the terrain, execute a field-purification method using boiling and charcoal layers to render the water safe for consumption. Learning Outcome: Water purification techniques in the wild.",
        clueHint: "Show your filtered water sample to the medical officer.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 200,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-21T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
      {
        title: "Operation: Solar Eclipse",
        description: "The grand finale. Factions deploy into the woods for a 10 kilometer night march. They must use stars and celestial markers for directional backups, map out terrain anomalies, utilize concealment techniques, and hack hidden GeoNodes using terminal passcodes and live GPS check-ins. Learning Outcome: 10km night navigation, celestial tracking, map reading, crawling, and camouflage.",
        clueHint: "Ensure your smartphone battery is fully loaded before nightfall.",
        verificationType: VerificationType.LEADER_SIGN_OFF,
        encryptedAnswerHash: null,
        creditReward: 500,
        isReleased: true,
        unlockedAtDate: new Date("2026-07-22T00:00:00Z"),
        phase: QuestPhase.LIVE_CAMP,
      },
    ];

    const seededQuests = [];
    for (const q of questsData) {
      const dbQuest = await prisma.quest.create({
        data: q,
      });
      seededQuests.push(dbQuest);
    }

    // 2. Shop Items Seeding (Helios Marketplace Perks)
    const shopItemsData = [
      {
        title: "The Quartermaster's Rations",
        description: "Upgrades the winning Rover's standard meal kit to a premium, leader-tier food basket (including local meats for grilling, premium snacks, and cold beverages) for 24 hours.",
        type: ShopItemType.AUCTION,
        priceOrCurrentBid: 200,
        stock: 0,
        isAvailable: true,
      },
      {
        title: "The Command Exemption",
        description: "Grants the Rover a full pass to delegate their morning physical training, camp cleanup, or tool-maintenance duties to any other scout for two full days.",
        type: ShopItemType.AUCTION,
        priceOrCurrentBid: 250,
        stock: 0,
        isAvailable: true,
      },
      {
        title: "The Luxury Basecamp Rig",
        description: "Immediate rental access to an elite camping setup—including an elevated cot, premium personal shade canopy, an automated charging bay, and an ergonomic camp chair.",
        type: ShopItemType.AUCTION,
        priceOrCurrentBid: 300,
        stock: 0,
        isAvailable: true,
      },
      {
        title: "Tactical Sat-Intel Drop",
        description: "Unlocks a high-resolution topographic overlay showing the exact coordinates and map symbols for 2 hidden nodes before the July 22 night march.",
        type: ShopItemType.FIXED_PRICE,
        priceOrCurrentBid: 400,
        stock: 5,
        isAvailable: true,
      },
      {
        title: "Helios Signal Jammer",
        description: "Blocks the opposing faction from checking the live map server or registering passcode captures for 15 minutes during the night navigation phase.",
        type: ShopItemType.FIXED_PRICE,
        priceOrCurrentBid: 300,
        stock: 10,
        isAvailable: true,
      },
    ];

    const seededShopItems = [];
    for (const item of shopItemsData) {
      const dbItem = await prisma.shopItem.create({
        data: item,
      });
      seededShopItems.push(dbItem);
    }

    // 3. GeoNodes Seeding
    const geoNodesData = [
      {
        name: "Sector Alpha-1 (Ancient Ruins)",
        latitude: 34.1205,
        longitude: 35.6482,
        radiusMeters: 30,
        secretPasscode: "ancient_sun",
        controllingFaction: null,
      },
      {
        name: "Sector Beta-3 (Beach Forest)",
        latitude: 34.1189,
        longitude: 35.6455,
        radiusMeters: 25,
        secretPasscode: "ocean_breeze",
        controllingFaction: Faction.ALPHA,
      },
      {
        name: "Sector Gamma-5 (Camp Headquarters)",
        latitude: 34.1245,
        longitude: 35.6521,
        radiusMeters: 20,
        secretPasscode: "scout_spirit",
        controllingFaction: Faction.BRAVO,
      },
    ];

    const seededNodes = [];
    for (const node of geoNodesData) {
      const dbNode = await prisma.geoNode.create({
        data: node,
      });
      seededNodes.push(dbNode);
    }

    return NextResponse.json({
      success: true,
      message: "Scouts des Cèdres official curriculum seeded successfully!",
      questsCount: seededQuests.length,
      shopItemsCount: seededShopItems.length,
      nodesCount: seededNodes.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
