import type { HomeContent } from "@/lib/translations";

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
		items: [
			{
				name: "Louveteaux / Jeanettes",
				ageRange: "Ages 6 – 11",
				description: "Discovering teamwork, creativity, and nature through camps and fun-filled outings.",
				color: "from-lime-400 to-emerald-500",
			},
			{
				name: "Castors",
				ageRange: "Ages 6 – 8",
				description: "Playful adventures and first steps into scouting through games, songs, and simple challenges.",
				color: "from-emerald-500 to-emerald-700",
			},
			{
				name: "Scouts",
				ageRange: "Ages 11 – 14",
				description: "Building confidence, learning outdoor skills, and growing strong friendships.",
				color: "from-teal-500 to-emerald-600",
			},
			{
				name: "Pionniers",
				ageRange: "Ages 14 – 17",
				description: "Leading service projects, exploring the world, and living the scout values in action.",
				color: "from-emerald-600 to-green-800",
			},
		],
	},
	activities: {
		title: "Upcoming Activities",
		subtitle: "Highlights from our calendar for the first semester.",
		cta: "View full calendar →",
		items: [
			{
				slug: "family-welcome-campfire",
				title: "Family Welcome Campfire",
				date: "September 14, 2024",
				description: "An evening of songs, games, and meeting the leaders to kick off the scouting year.",
				location: "Parc Saint Jean",
				datetime: "2024-09-14T18:00:00+03:00",
				endTime: "2024-09-14T21:00:00+03:00",
				image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
				section: "All Sections",
				highlights: [
					"Campfire songs and skits to welcome new families",
					"Parent orientation with Q&A circles led by our scouters",
					"Icebreaker challenges for every age group",
				],
				gear: ["Reusable water bottle", "Camp chair or picnic blanket", "Scout neckerchief"],
				contact: "Leader Marie · +961 372 4473",
			},
			{
				slug: "autumn-skills-camp",
				title: "Autumn Skills Camp",
				date: "October 4 – 6, 2024",
				description: "Weekend camp focusing on outdoor cooking, pioneering, and teamwork challenges.",
				location: "Camp Lac Vert",
				datetime: "2024-10-04T17:00:00+03:00",
				endTime: "2024-10-06T12:00:00+03:00",
				image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
				section: "Scouts & Pionniers",
				highlights: [
					"Patrol camp setup and wilderness cooking labs",
					"Night navigation challenge through cedar trails",
					"Sunday closing liturgy and parent debrief",
				],
				gear: ["Complete weekend pack", "Sleeping bag (3-season)", "Hiking boots & rain shell"],
				contact: "Leader Joseph · +961 711 554 892",
			},
			{
				slug: "community-service-day",
				title: "Community Service Day",
				date: "November 9, 2024",
				description: "All sections unite to support our neighborhood through a day of helpful service projects.",
				location: "Community Center",
				datetime: "2024-11-09T09:00:00+03:00",
				endTime: "2024-11-09T15:00:00+03:00",
				image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1600&q=80",
				section: "All Sections",
				highlights: [
					"Neighborhood cleanup and tree planting teams",
					"Castors craft cards for the parish seniors",
					"Hot lunch prepared by the parent committee",
				],
				gear: ["Work gloves", "Refillable water bottle", "Group t-shirt or neckerchief"],
				contact: "Leader Sarah · +961 702 220 456",
			},
			{
				slug: "winter-leadership-hike",
				title: "Winter Leadership Hike",
				date: "December 7, 2024",
				description: "Senior scouts tackle a ridge hike focused on leadership rotations and winter prep skills.",
				location: "Chouf Cedar Reserve",
				datetime: "2024-12-07T08:00:00+02:00",
				endTime: "2024-12-07T17:00:00+02:00",
				image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
				section: "Pionniers",
				highlights: [
					"Rotating leadership checkpoints with mentor feedback",
					"Winter shelter building and stove safety clinics",
					"Solo reflection overlooking the cedar valleys",
				],
				gear: ["Daypack with layered clothing", "Trekking poles", "Thermos with hot drink"],
				contact: "Leader Antoine · +961 356 9911",
			},
		],
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
