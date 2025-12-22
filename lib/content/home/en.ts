import { buildActivitiesList } from "@/lib/content/shared/activities/data";
import { buildSectionsContent } from "@/lib/content/shared/sections/data";
import type { HomeContent } from "@/lib/translations";

const sectionPalette = [
	"from-emerald-500 to-emerald-700",
	"from-lime-400 to-emerald-500",
	"from-teal-500 to-emerald-600",
	"from-emerald-600 to-green-800",
];

const homeSectionsEn = buildSectionsContent("en").map((section, index) => ({
	id: section.id,
	name: section.name,
	ageRange: section.ageRange,
	description: section.description,
	color: sectionPalette[index % sectionPalette.length],
}));

export const homeEn: HomeContent = {
	hero: {
		badge: "Scouts des Cedres ",
		title: "Welcome to SDC Saint Jean Marc",
		description:
			"A vibrant scout family for children and teens to grow through adventure, service, and friendship. Join us to discover the joys of scouting in a warm, faith-filled community.",
		primaryCta: "Join Our Group",
		secondaryCta: "Discover Our Sections",
		heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80",
		// /images/scout-illustration.jpg
	},
	whoWeAre: {
		title: "Who We Are",
		paragraphs: [
			"The SDC Saint Jean Marc scouting group welcomes young people of all backgrounds. Guided by experienced leaders, we help each scout grow in confidence, faith, and responsibility while having unforgettable adventures.",
			"From weekend camps to community service, every activity is designed to inspire curiosity, build skills, and foster friendships that last a lifetime.",
		],
		highlights: {
			mission: {
				title: "Our Mission",
				description: "Supporting families by offering young people a place to grow, serve, and lead with joy.",
			},
			rhythm: {
				title: "Weekly Rhythm",
				description: "Saturday afternoons at our parish hall, plus monthly outings and special events.",
			},
			service: {
				title: "Faith & Service",
				description: "Living the scout law and supporting our community through acts of service big and small.",
			},
			leadership: {
				title: "Leadership",
				description: "Older scouts mentor younger sections, growing as leaders along the way.",
			},
		},
	},
	sections: {
		title: "Our Sections",
		subtitle: "Each age group follows a program tailored to their development.",
		cta: "Meet every section →",
		items: homeSectionsEn,
	},
	activities: {
		title: "Upcoming Activities",
		subtitle: "Highlights from our calendar for the first semester.",
		cta: "View full calendar →",
		items: buildActivitiesList("en"),
	},
	gallery: {
		title: "Gallery Preview",
		subtitle: "Moments that capture the spirit of scouting.",
		cta: "See the gallery →",
		items: [
			{
				title: "Forest Hike",
				description: "Exploring our favorite trails together.",
				background: "bg-gradient-to-br from-emerald-200 via-emerald-50 to-slate-100",
			},
			{
				title: "Campfire Songs",
				description: "Voices united under the stars.",
				background: "bg-gradient-to-br from-amber-200 via-orange-50 to-slate-100",
			},
			{
				title: "Service Project",
				description: "Giving back to our community with pride.",
				background: "bg-gradient-to-br from-teal-200 via-emerald-50 to-slate-100",
			},
			{
				title: "Adventure Weekend",
				description: "Team challenges that build lifelong friendships.",
				background: "bg-gradient-to-br from-lime-200 via-emerald-50 to-slate-100",
			},
		],
	},
	highlightStrip: {
		nextEventLabel: "Next big outing",
		stats: [
			{ value: "80+", label: "Active scouts" },
			{ value: "20", label: "Volunteer leaders" },
		],
	},
	testimonial: {
		title: "Parents see the difference",
		items: [
			{
				quote: "“SDC Saint Jean Marc has given our kids confidence, lifelong friends, and a deeper love for service. Every Saturday they come home glowing with stories.”",
				author: "Rita A.",
				role: "Scout mom",
			},
			{
				quote: "“The leaders are so intentional. Our son now volunteers at church because he learned how meaningful service can be in this troop.”",
				author: "Marc L.",
				role: "Castor parent",
			},
			{
				quote: "“It feels like family. Camps, liturgies, and projects are all beautifully organized—we trust the team completely.”",
				author: "Nadia S.",
				role: "Pionnier parent",
			},
		],
	},
	callToAction: {
		title: "Ready to Start the Adventure?",
		description:
			"Join our welcoming scout family, meet inspiring leaders, and discover experiences that will shape your child for life. We can’t wait to meet you!",
		primaryCta: "Get Information Pack",
		secondaryCta: "Talk with a Leader",
	},
};
