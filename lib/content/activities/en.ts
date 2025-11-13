import type { ActivitiesPageContent } from "@/lib/translations";

export const activitiesPageEn: ActivitiesPageContent = {
	hero: {
		badge: "Activities Calendar",
		title: "Upcoming adventures & gatherings",
		description:
			"The SDC Saint Jean Marc program keeps scouts moving with camps, service, and leadership opportunities. Explore what’s coming this month.",
		image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
		highlights: ["Progressive program", "Personal mentoring", "Vibrant patrol life"],
		primaryCta: { label: "View calendar", href: "#calendar" },
		secondaryCta: { label: "Highlighted events", href: "#featured" },
	},
	intro:
		"We weave together adventure, service, and faith-forming moments. Every section discovers experiences that grow character and leave lasting memories.",
	featured: {
		title: "Highlighted activities",
		subtitle: "A curated look at the standout events you won’t want to miss this month.",
	},
	calendar: {
		title: "This month at a glance",
		subtitle: "Check back each week for updates and registration notes for families.",
		badgePrefix: "",
		badgeSuffix: " calendar",
		ctaLabel: "Ask about an activity",
		ctaHref: "/contact",
	},
	spotlights: [
		{
			badge: "Adventure Labs",
			title: "Skills in the Wild",
			description:
				"Small teams led by our scouters practice fire building, navigation, and overnight safety through real-life scenarios that fuel courage.",
			image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
			statValue: "6",
			statLabel: "overnight camps / year",
		},
		{
			badge: "Service Impact",
			title: "Community First",
			description:
				"From riverbank cleanups to visiting seniors, scouts live out service every month and discover what humble leadership looks like.",
			image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
			statValue: "12",
			statLabel: "service projects",
		},
		{
			badge: "Faith Moments",
			title: "Campfire Reflections",
			description:
				"Evening reflections and chapel moments invite scouts to root their adventures in gratitude, friendship, and prayerful silence.",
			image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
			statValue: "1",
			statLabel: "weekly faith pause",
		},
	],
	spotlightsIntro: {
		title: "Why scouts love our program",
		subtitle: "Visual snapshots of the adventures, service, and faith moments that shape lifelong memories.",
	},
	galleryPreview: {
		title: "Gallery preview",
		subtitle: "A peek at recent camps, workshops, and service projects.",
		ctaLabel: "See full gallery",
		images: [
			{
				src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
				alt: "Campfire night",
				title: "Campfire night",
			},
			{
				src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
				alt: "Trail hike",
				title: "Trail hike",
			},
			{
				src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
				alt: "River challenge",
				title: "River challenge",
			},
			{
				src: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1200&q=80",
				alt: "Service day",
				title: "Service day",
			},
		],
	},
};
