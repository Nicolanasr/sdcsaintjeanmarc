import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";
import AdminClientPage from "./AdminClientPage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getRoverSession();

  // Route Protection: Admin check
  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (session.profile.role !== "admin") {
    redirect(`/${locale}/rovers/terminal`);
  }

  // Load all quests
  const quests = await prisma.quest.findMany({
    orderBy: { unlockedAtDate: "asc" },
  });

  // Load all profiles (scouts and admins)
  const allProfiles = await prisma.profile.findMany({
    include: {
      roverProfile: true,
      questCompletions: {
        include: { quest: true },
      },
    },
    orderBy: { fullName: "asc" },
  });

  // Provision RoverProfiles for users who are scouts and don't have one
  const usersList = [];
  for (const u of allProfiles) {
    let roverProfile = u.roverProfile;
    if (!roverProfile && u.role === "scout") {
      roverProfile = await prisma.roverProfile.create({
        data: {
          profileId: u.id,
          roverCredits: 0,
          faction: null,
          phoneNumber: "",
        },
      });
    }
    usersList.push({
      ...u,
      roverProfile,
    });
  }

  // Load all marketplace shop items
  const shopItems = await prisma.shopItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      highestBidder: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  // Load system setting for Night Nav
  const navSetting = await prisma.systemSetting.findUnique({
    where: { key: "night_nav_active" },
  });
  const nightNavActive = navSetting?.value === "true";

  // Load system setting for Lucky Wheel
  const wheelSetting = await prisma.systemSetting.findUnique({
    where: { key: "lucky_wheel_active" },
  });
  const luckyWheelActive = wheelSetting ? wheelSetting.value === "true" : true;

  // Load system setting for Hotspot threshold override
  const thresholdSetting = await prisma.systemSetting.findUnique({
    where: { key: "hotspot_scout_threshold" },
  });
  const hotspotThreshold = thresholdSetting ? parseInt(thresholdSetting.value, 10) : null;

  // Load system setting for GPS capture perimeter
  const perimeterSetting = await prisma.systemSetting.findUnique({
    where: { key: "capture_perimeter_meters" },
  });
  const capturePerimeter = perimeterSetting ? parseInt(perimeterSetting.value, 10) : 100;

  // Load all geoNodes
  const nodes = await prisma.geoNode.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <AdminClientPage
      initialQuests={quests}
      initialRovers={usersList}
      initialShopItems={shopItems}
      initialLogs={[]}
      initialNodes={nodes}
      locale={locale}
      initialNightNavActive={nightNavActive}
      initialHotspotThreshold={hotspotThreshold}
      initialLuckyWheelActive={luckyWheelActive}
      initialCapturePerimeter={capturePerimeter}
    />
  );
}
