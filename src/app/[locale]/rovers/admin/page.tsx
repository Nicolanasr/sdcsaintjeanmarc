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

  // Load all logs (last 200 entries)
  const logs = await prisma.whatsAppLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AdminClientPage
      initialQuests={quests}
      initialRovers={usersList}
      initialShopItems={shopItems}
      initialLogs={logs}
      locale={locale}
      initialNightNavActive={nightNavActive}
    />
  );
}
