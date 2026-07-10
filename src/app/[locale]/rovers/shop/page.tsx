import React from "react";
import { redirect } from "next/navigation";
import { getRoverSession } from "@/app/actions/rovers";
import { prisma } from "@/lib/prisma";
import ShopClientPage from "./ShopClientPage";
import { ShopItemType } from "@prisma/client";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ShopPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await getRoverSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Load all shop items
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

  const fixedItems = shopItems.filter((item) => item.type === ShopItemType.FIXED_PRICE);
  const auctionItems = shopItems.filter((item) => item.type === ShopItemType.AUCTION);
  const isAdmin = session.profile.role === "admin";
  const currentCredits = session.roverProfile?.roverCredits ?? 0;

  const wheelSetting = await prisma.systemSetting.findUnique({
    where: { key: "lucky_wheel_active" },
  });
  const luckyWheelActive = wheelSetting ? wheelSetting.value === "true" : true;

  return (
    <ShopClientPage
      fixedItems={fixedItems}
      auctionItems={auctionItems}
      currentUserId={session.profile.id}
      locale={locale}
      isAdmin={isAdmin}
      initialCredits={currentCredits}
      luckyWheelActive={luckyWheelActive}
    />
  );
}
