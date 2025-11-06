import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActivityDetail } from "@/components/activity-detail";
import type { ActivityContent } from "@/lib/translations";
import { translations } from "@/lib/translations";

type EventPageProps = {
    params: {
        event: string;
    };
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

export function generateMetadata({ params }: EventPageProps): Metadata {
    const activity = findActivityBySlug(params.event, englishActivities);

    if (!activity) {
        return {};
    }

    return {
        title: `${activity.title} | SDC Saint Jean Marc`,
        description: activity.description,
    };
}

export default function ActivityEventPage({ params }: EventPageProps) {
    const englishEvent = findActivityBySlug(params.event, englishActivities);
    const arabicEvent = findActivityBySlug(params.event, arabicActivities);

    if (!englishEvent || !arabicEvent) {
        notFound();
    }

    const relatedEnglish = englishActivities.filter((item) => item.slug !== params.event);
    const relatedArabic = arabicActivities.filter((item) => item.slug !== params.event);

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
