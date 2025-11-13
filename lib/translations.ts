import { aboutAr } from "./content/about/ar";
import { aboutEn } from "./content/about/en";
import { activitiesPageAr } from "./content/activities/ar";
import { activitiesPageEn } from "./content/activities/en";
import { galleryPageAr } from "./content/gallery/ar";
import { galleryPageEn } from "./content/gallery/en";
import { homeAr } from "./content/home/ar";
import { homeEn } from "./content/home/en";
import { layoutAr } from "./content/layout/ar";
import { layoutEn } from "./content/layout/en";
import { sectionsPageAr } from "./content/sections/ar";
import { sectionsPageEn } from "./content/sections/en";

export type SectionContent = {
	name: string;
	ageRange: string;
	description: string;
	color: string;
};

export type ActivityContent = {
	slug: string;
	title: string;
	date: string;
	description: string;
	location: string;
	datetime: string;
	endTime: string;
	image: string;
	section: string;
	highlights: string[];
	gear: string[];
	contact: string;
};

export type GalleryContent = {
	title: string;
	description: string;
	background: string;
};

export type GalleryImage = {
	id: string;
	title: string;
	description: string;
	image: string;
	section: string;
	activity: string;
	date: string;
	location: string;
	tags: string[];
};

export type GalleryAlbum = {
	id: string;
	title: string;
	description: string;
	coverImage: string;
	section: string;
	location: string;
	dateRange: string;
	sortDate: string;
	tags: string[];
	stats: { value: string; label: string }[];
	images: GalleryImage[];
};

export type GalleryPageContent = {
	hero: {
		badge: string;
		title: string;
		description: string;
		image: string;
		stats: { value: string; label: string }[];
	};
	filters: {
		sectionLabel: string;
		tagLabel: string;
		sortLabel: string;
		sortOptions: { value: string; label: string }[];
	};
	albums: GalleryAlbum[];
	emptyState: {
		title: string;
		description: string;
	};
};

export type LeadershipProfile = {
	id: string;
	name: string;
	role: string;
	bio: string;
	photo: string;
};

export type LeadershipRow = {
	label: string;
	highlight?: boolean;
	compact?: boolean;
	nodes: { leader: string; assistants: string[] }[];
};

export type LeadershipContent = {
	title: string;
	items: LeadershipProfile[];
	orgChart: {
		rows: LeadershipRow[];
	};
};

export type TimelineIconKey = "campfire" | "friends" | "mountains" | "shield";
export type StatIconKey = "campfire" | "community" | "calendar";

export type AboutContent = {
	hero: {
		badge: string;
		title: string;
		description: string;
		image: string;
	};
	history: {
		title: string;
		timeline: { year: string; title: string; description: string; icon: TimelineIconKey }[];
	};
	pillars: {
		title: string;
		items: { title: string; description: string }[];
	};
	leadership: LeadershipContent;
	rhythm: {
		title: string;
		schedule: { day: string; description: string }[];
		participation: {
			title: string;
			steps: string[];
		};
		featureImage: {
			src: string;
			label: string;
			caption: string;
		};
	};
	impact: {
		title: string;
		stats: { label: string; value: string }[];
	};
	faq: {
		title: string;
		items: { question: string; answer: string }[];
	};
	callToAction: {
		title: string;
		description: string;
		primaryCta: string;
		secondaryCta: string;
	};
};

export type HomeContent = {
	hero: {
		badge: string;
		title: string;
		description: string;
		primaryCta: string;
		secondaryCta: string;
		heroImage: string;
	};
	whoWeAre: {
		title: string;
		paragraphs: [string, string];
		highlights: {
			mission: { title: string; description: string };
			rhythm: { title: string; description: string };
			service: { title: string; description: string };
			leadership: { title: string; description: string };
		};
	};
	sections: {
		title: string;
		subtitle: string;
		cta: string;
		items: SectionContent[];
	};
	activities: {
		title: string;
		subtitle: string;
		cta: string;
		items: ActivityContent[];
	};
	gallery: {
		title: string;
		subtitle: string;
		cta: string;
		items: GalleryContent[];
	};
	highlightStrip: {
		nextEventLabel: string;
		stats: { value: string; label: string }[];
	};
	testimonial: {
		title: string;
		items: {
			quote: string;
			author: string;
			role: string;
		}[];
	};
	callToAction: {
		title: string;
		description: string;
		primaryCta: string;
		secondaryCta: string;
	};
};

export type ActivitiesPageContent = {
	hero: {
		badge: string;
		title: string;
		description: string;
		image: string;
		highlights: string[];
		primaryCta: { label: string; href: string };
		secondaryCta: { label: string; href: string };
	};
	intro: string;
	featured: {
		title: string;
		subtitle: string;
	};
	calendar: {
		title: string;
		subtitle: string;
		badgePrefix: string;
		badgeSuffix: string;
		ctaLabel: string;
		ctaHref: string;
	};
	spotlights: {
		badge: string;
		title: string;
		description: string;
		image: string;
		statValue: string;
		statLabel: string;
	}[];
	spotlightsIntro: {
		title: string;
		subtitle: string;
	};
	galleryPreview: {
		title: string;
		subtitle: string;
		ctaLabel: string;
		images: { src: string; alt: string; title: string }[];
	};
};

export type SectionsPageContent = {
	hero: {
		badge: string;
		title: string;
		description: string;
		image: string;
		cta: string;
		ctaLink?: string;
	};
	overview: {
		text: string;
		stats: { value: string; label: string; icon?: StatIconKey }[];
	};
	sections: {
		id: string;
		name: string;
		ageRange: string;
		motto: string;
		description: string;
		meeting: string;
		image: string;
		focus: string[];
		leadership: {
			chief: { id?: string; name: string; avatar: string };
			assistants: { id?: string; name: string; avatar: string }[];
			patrols: { name: string; leader: string; assistant: string; members: string[] }[];
		};
	}[];
	faq: { question: string; answer: string }[];
	cta: {
		title: string;
		description: string;
		primary: string;
		secondary: string;
	};
};

export type LayoutContent = {
	nav: {
		home: string;
		about: string;
		sections: string;
		activities: string;
		gallery: string;
		join: string;
		contact: string;
	};
	groupTagline: string;
	groupName: string;
	footerMission: string;
	footerSchedule: string;
	footerContact: string;
	languageToggle: {
		label: string;
		english: string;
		arabic: string;
	};
};

export type Translations = {
	layout: LayoutContent;
	home: HomeContent;
	about: AboutContent;
	activitiesPage: ActivitiesPageContent;
	sectionsPage: SectionsPageContent;
	galleryPage: GalleryPageContent;
};

export const translations: Record<string, Translations> = {
	en: {
		layout: layoutEn,
		home: homeEn,
		about: aboutEn,
		activitiesPage: activitiesPageEn,
		sectionsPage: sectionsPageEn,
		galleryPage: galleryPageEn,
	},
	ar: {
		layout: layoutAr,
		home: homeAr,
		about: aboutAr,
		activitiesPage: activitiesPageAr,
		sectionsPage: sectionsPageAr,
		galleryPage: galleryPageAr,
	},
};
