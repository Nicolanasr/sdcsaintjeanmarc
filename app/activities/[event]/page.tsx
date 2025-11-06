import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityDetail } from "@/components/activity-detail";
import type { ActivityContent } from "@/lib/translations";
import { translations } from "@/lib/translations";

type EventParams = {
    event: string;
};

type EventPageProps = {
    params: Promise<EventParams>;
};

const englishActivities = translations.en.home.activities.items;
const arabicActivities = translations.ar.home.activities.items;

const findActivityBySlug = (slug: string, list: ActivityContent[]) =>
    list.find((item) => item.slug === slug);

export function generateStaticParams() {
    return englishActivities.map((activity) => ({
        event: activity.slug,
    }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const { event } = await params;
    const activity = findActivityBySlug(event, englishActivities);

    if (!activity) {
        return {};
    }

    return {
        title: `${activity.title} | SDC Saint Jean Marc`,
        description: activity.description,
    };
}

export default async function ActivityEventPage({ params }: EventPageProps) {
    const { event } = await params;
    const englishEvent = findActivityBySlug(event, englishActivities);
    const arabicEvent = findActivityBySlug(event, arabicActivities);

    if (!englishEvent || !arabicEvent) {
        notFound();
    }

    const relatedEnglish = englishActivities.filter((item) => item.slug !== event);
    const relatedArabic = arabicActivities.filter((item) => item.slug !== event);

    return (
        <ActivityDetail
            event={{
                en: englishEvent,
                ar: arabicEvent,
            }}
            related={{
                en: relatedEnglish,
                ar: relatedArabic,
            }}
        />
    );
}
