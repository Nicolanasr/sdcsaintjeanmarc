import type { SectionsPageContent } from "@/lib/translations";

export const sectionsPageEn: SectionsPageContent = {
	hero: {
		badge: "Sections",
		title: "A clear path for every age",
		description:
			"From Louveteaux to Caravelles, every branch helps scouts grow through age-appropriate challenges, service, and leadership.",
		image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
		cta: "Download program guide",
	},
	overview: {
		text: "Six branches form one family. Explore how each section is organized and meet the chiefs guiding your children each week.",
		stats: [
			{ value: "6", label: "Active sections" },
			{ value: "24", label: "Section leaders" },
			{ value: "80+", label: "Youth enrolled" },
		],
	},
	sections: [
		{
			id: "louveteaux",
			name: "Louveteaux",
			ageRange: "Ages 8 – 11",
			motto: "Always ready",
			description: "Playful patrol games, first overnight camps, and service badges help Louveteaux discover teamwork and imagination.",
			meeting: "Saturday · 2:00 PM · Parish hall",
			image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
			focus: ["Patrol life", "Faith moments", "Crafts"],
		leadership: {
			chief: {
				name: "Anthony Rizk",
				avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=200&q=80",
			},
			assistant: {
				name: "Yara Saab",
				avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
			},
			patrols: [
				{
					name: "Meute Saint Jean",
					leader: "Karim Chidiac",
					assistant: "Nour Maalouf",
					members: ["Elias", "Marc", "Rami", "Dalia"],
				},
				{
					name: "Patrol Saint Louis",
					leader: "Anthony Gerges",
					assistant: "Rita Chedid",
					members: ["Jad", "Nayla", "Fares", "Myriam"],
				},
				{
					name: "Patrol Jeanne d'Arc",
					leader: "Toni Farah",
					assistant: "Mira Abou Khalil",
					members: ["Lea", "Sofia", "Paul", "Youssef"],
				},
			],
		},
	},
		{
			id: "jeanettes",
			name: "Jeannettes",
			ageRange: "Ages 8 – 11",
			motto: "Joyful service",
			description: "Story-based gatherings, ateliers, and songs help Jeannettes grow in creativity and service.",
			meeting: "Saturday · 2:00 PM · Studio room",
			image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
			focus: ["Creative ateliers", "Outreach", "Songs"],
		leadership: {
			chief: {
				name: "Maya Tannous",
				avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
			},
			assistant: {
				name: "Julie Nasr",
				avatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
			},
			patrols: [
				{
					name: "Ronde Notre Dame",
					leader: "Claudia Rizk",
					assistant: "Perla Ferzli",
					members: ["Elsa", "Maria", "Isabelle", "Noor"],
				},
				{
					name: "Ronde Saint Rita",
					leader: "Lynn Saad",
					assistant: "Jessica Tabet",
					members: ["Sarah", "Tala", "Rania", "Carla"],
				},
			],
		},
	},
		{
			id: "scouts",
			name: "Scouts",
			ageRange: "Ages 12 – 14",
			motto: "Be prepared",
			description: "Scouts dive into pioneering, backcountry skills, and weekend camps that stretch courage and leadership.",
			meeting: "Saturday · 4:30 PM · Field",
			image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
			focus: ["Pioneering", "Navigation", "Service projects"],
		leadership: {
			chief: {
				name: "Omar Khoury",
				avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
			},
			assistant: {
				name: "Sami Abou Khalil",
				avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
			},
			patrols: [
				{
					name: "Troop Saint Joseph",
					leader: "Georges Nassar",
					assistant: "Elie Abi Hayla",
					members: ["Karim", "Michel", "Roy", "Charbel"],
				},
				{
					name: "Troop Cedars",
					leader: "Ralph Youssef",
					assistant: "Walid Farhat",
					members: ["Ziad", "Nabil", "Adrian", "Tony"],
				},
			],
		},
	},
		{
			id: "guides",
			name: "Guides",
			ageRange: "Ages 12 – 14",
			motto: "Forward together",
			description: "Guides mix formation weekends, liturgy service, and nature treks to build sisterhood rooted in faith.",
			meeting: "Saturday · 4:30 PM · Upper hall",
			image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1200&q=80",
			focus: ["Leadership", "Faith sharing", "Backpacking"],
		leadership: {
			chief: {
				name: "Lea Daher",
				avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80",
			},
			assistant: {
				name: "Clara Abboud",
				avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
			},
			patrols: [
				{
					name: "Compagnie Sainte Rafqa",
					leader: "Christy Azar",
					assistant: "Joelle Massoud",
					members: ["Maya", "Sandra", "Christina", "Helena"],
				},
				{
					name: "Compagnie Notre Dame",
					leader: "Rita Sleiman",
					assistant: "Elsa Daher",
					members: ["Nour", "Mira", "Paula", "Racha"],
				},
			],
		},
	},
		{
			id: "routiers",
			name: "Routiers",
			ageRange: "Ages 15 – 17",
			motto: "Serve and lead",
			description: "Routiers embrace longer expeditions, mentoring younger patrols, and discernment retreats.",
			meeting: "Friday · 7:00 PM · Community house",
			image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
			focus: ["Expeditions", "Mentorship", "Vocational discernment"],
		leadership: {
			chief: {
				name: "Omar Khoury",
				avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
			},
			assistant: {
				name: "Sami Abou Khalil",
				avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80",
			},
			patrols: [
				{
					name: "Clan Saint Georges",
					leader: "Philippe Khoury",
					assistant: "Joseph Azzi",
					members: ["Fadi", "Bishara", "Charbel", "Sami"],
				},
				{
					name: "Clan Saint Paul",
					leader: "Malek Chalhoub",
					assistant: "Ziad Antoun",
					members: ["Amin", "Hassan", "Elias", "Hadi"],
				},
			],
		},
	},
		{
			id: "caravelles",
			name: "Caravelles",
			ageRange: "Ages 15 – 17",
			motto: "Bold hope",
			description: "Caravelles lead international service, parish missions, and creative labs that prepare them for adult life.",
			meeting: "Friday · 7:00 PM · Rooftop studio",
			image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
			focus: ["Global service", "Liturgy support", "Project management"],
		leadership: {
			chief: {
				name: "Christelle Nassar",
				avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
			},
			assistant: {
				name: "Hiba Gerges",
				avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
			},
			patrols: [
				{
					name: "Hearth Saint Rita",
					leader: "Christelle Karam",
					assistant: "Yasmina Sfeir",
					members: ["Layal", "Sabine", "Gabrielle", "Maria"],
				},
				{
					name: "Hearth Saint Clare",
					leader: "Rana Fakhry",
					assistant: "Lina Daher",
					members: ["Perla", "Nadine", "Celine", "Vicky"],
				},
				{
					name: "Hearth Saint Bernadette",
					leader: "Sara Bou Ghosn",
					assistant: "Joanna Rahme",
					members: ["Farah", "Elissa", "Aline", "Pamela"],
				},
			],
		},
	},
	],
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
