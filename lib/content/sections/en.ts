import { buildSectionsContent } from "@/lib/content/shared/sections/data";
import type { SectionsPageContent } from "@/lib/translations";

export const sectionsPageEn: SectionsPageContent = {
	hero: {
		badge: "Sections",
		title: "A clear path for every age",
		description:
			"From Louveteaux to Caravelles, every branch helps scouts grow through age-appropriate challenges, service, and leadership.",
		image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
		cta: "Download program guide",
		ctaLink: "/docs/program-guide.pdf",
	},
	overview: {
		text: "Six branches form one family. Explore how each section is organized and meet the chiefs guiding your children each week.",
		stats: [
			{ value: "6", label: "Active sections", icon: "campfire" },
			{ value: "24", label: "Section leaders", icon: "community" },
			{ value: "80+", label: "Youth enrolled", icon: "calendar" },
		],
	},
	sections: buildSectionsContent("en"),
	faq: [
	{
		question: "How are sections organized?",
		answer: "Each branch has a chief, assistant, and patrols of 6–8 scouts who stay together for the year.",
	},
		{
			question: "Is the uniform required?",
			answer: "Yes. We provide a checklist per section and offer assistance if acquiring the uniform is a challenge.",
		},
		{
			question: "Can siblings be in different sections?",
			answer: "Absolutely. Meeting times overlap on Saturdays so families can drop off and pick up multiple branches comfortably.",
		},
	{
		question: "How do patrols work?",
		answer: "Every patrol has a youth leader, an assistant, and members who share duties, plan skits, and progress through badges together.",
	},
	],
cta: {
	title: "Ready to visit a section?",
	description: "Schedule a Saturday visit, meet the chiefs, and see how scouting can shape your child's next adventure.",
	primary: "Book a visit",
	secondary: "Talk to a section chief",
},
	};
