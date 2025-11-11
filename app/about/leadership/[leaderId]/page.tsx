import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeaderDetail } from "@/components/leader-detail";
import type { AboutContent } from "@/lib/translations";
import { translations } from "@/lib/translations";

type LeaderParams = {
  leaderId: string;
};

type LeaderPageProps = {
  params: Promise<LeaderParams>;
};

const englishLeaders = translations.en.about.leadership.items;
const arabicLeaders = translations.ar.about.leadership.items;

const findLeader = (id: string, list: AboutContent["leadership"]["items"]) =>
  list.find((leader) => leader.id === id);

export function generateStaticParams() {
  return englishLeaders.map((leader) => ({
    leaderId: leader.id,
  }));
}

export async function generateMetadata({ params }: LeaderPageProps): Promise<Metadata> {
  const { leaderId } = await params;
  const leader = findLeader(leaderId, englishLeaders);

  if (!leader) {
    return {};
  }

  return {
    title: `${leader.name} | SDC Saint Jean Marc`,
    description: leader.bio,
  };
}

export default async function LeaderPage({ params }: LeaderPageProps) {
  const { leaderId } = await params;
  const english = findLeader(leaderId, englishLeaders);
  const arabic = findLeader(leaderId, arabicLeaders);

  if (!english || !arabic) {
    notFound();
  }

  return (
    <LeaderDetail
      leader={{
        en: english,
        ar: arabic,
      }}
    />
  );
}
