import { leadershipEn } from "@/lib/content/shared/leadership/en";
import type { AboutContent } from "@/lib/translations";

export const aboutEn: AboutContent = {
	hero: {
		badge: "Our Story",
		title: "Rooted in faith, growing in adventure",
		description:
			"Since 1957, SDC Saint Jean Marc has welcomed young people to discover leadership, service, and friendship through the joy of scouting.",
		image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
	},
	history: {
		title: "Milestones that shaped us",
		timeline: [
			{
				year: "1957",
				title: "Foundation",
				description: "Parish leaders launch the troop to offer local youth a place to belong.",
				icon: "campfire",
			},
			{
				year: "1975",
				title: "First international camp",
				description: "Patrols travel to France, forging lasting scout friendships across borders.",
				icon: "mountains",
			},
			{
				year: "2003",
				title: "Service expansion",
				description: "Community partnerships multiply, adding monthly projects for every age group.",
				icon: "friends",
			},
			{
				year: "Today",
				title: "Four thriving sections",
				description: "Castors through Pionniers gather weekly with more than 20 volunteer leaders.",
				icon: "shield",
			},
		],
	},
	pillars: {
		title: "What guides every program",
		items: [
			{
				title: "Faith lived together",
				description: "Prayer, Mass, and reflections woven into each camp and service outing.",
			},
			{
				title: "Service close to home",
				description: "Neighborhood cleanups, parish outreach, and solidarity projects every month.",
			},
			{
				title: "Adventure with purpose",
				description: "Outdoor skills, camps, and challenges that build courage and teamwork.",
			},
			{
				title: "Leadership that grows",
				description: "Older scouts mentor younger ones and learn how to guide with humility.",
			},
		],
	},
	leadership: leadershipEn,
	rhythm: {
		title: "Weekly rhythm & how to get involved",
		schedule: [
			{ day: "Saturday 2:00 PM", description: "Castors & Louveteaux gather at the parish hall." },
			{ day: "Saturday 4:30 PM", description: "Scouts & Pionniers meet for patrol activities." },
			{ day: "Monthly outings", description: "All sections alternate camps, hikes, and service." },
		],
		participation: {
			title: "Ways to join our family",
			steps: [
				"Visit a Saturday meeting and meet the leaders.",
				"Attend our parent café to hear about the yearly program.",
				"Register your child or volunteer as part of the support team.",
			],
		},
		featureImage: {
			src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
			label: "Every Saturday",
			caption: "SDC Saint Jean Marc",
		},
	},
	impact: {
		title: "Impact in the past year",
		stats: [
			{ label: "Service hours", value: "1,200+" },
			{ label: "Major camps", value: "6" },
			{ label: "Families supported", value: "95" },
		],
	},
	faq: {
		title: "Questions families often ask",
		items: [
			{
				question: "What ages can join?",
				answer: "Castors start at age 6 and Pionniers go up to 17. We help families find the right section.",
			},
			{
				question: "Do we need prior experience?",
				answer: "Not at all—training happens during meetings, and older scouts mentor younger ones.",
			},
			{
				question: "How much does it cost?",
				answer: "We keep dues modest and offer support when needed. Camps have separate fees, but no child is turned away.",
			},
			{
				question: "How do you ensure safety?",
				answer: "All leaders are vetted, trained in youth protection, and every outing has medical and emergency plans.",
			},
		],
	},
	callToAction: {
		title: "Walk with us",
		description:
			"Whether you’re a new family, returning alumni, or a potential volunteer, there’s a place for you in the Saint Jean Marc story.",
		primaryCta: "Plan a visit",
		secondaryCta: "Talk with a leader",
	},
};
