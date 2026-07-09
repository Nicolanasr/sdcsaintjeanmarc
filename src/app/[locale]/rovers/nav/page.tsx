import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";
import NavClientPage from "./NavClientPage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NavPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getRoverSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Load system setting for Night Nav
  const navSetting = await prisma.systemSetting.findUnique({
    where: { key: "night_nav_active" },
  });
  const nightNavActive = navSetting?.value === "true";
  const isAdmin = session.profile.role === "admin";

  if (!nightNavActive && !isAdmin) {
    redirect(`/${locale}/rovers/terminal`);
  }

  // Load all GeoNodes
  const nodes = await prisma.geoNode.findMany({
    orderBy: { name: "asc" },
  });

  const userFaction = session.roverProfile?.faction ?? "";

  return (
    <NavClientPage
      nodes={nodes}
      userFaction={userFaction}
      locale={locale}
      userId={session.profile.id}
    />
  );
}
