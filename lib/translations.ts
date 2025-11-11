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

export type AboutContent = {
	hero: {
		badge: string;
		title: string;
		description: string;
		image: string;
	};
	history: {
		title: string;
		timeline: { year: string; title: string; description: string }[];
	};
	pillars: {
		title: string;
		items: { title: string; description: string }[];
	};
	leadership: {
		title: string;
		items: {
			id: string;
			name: string;
			role: string;
			bio: string;
			photo: string;
		}[];
		orgChart: {
			rows: {
				label: string;
				highlight?: boolean;
				compact?: boolean;
				nodes: { leader: string; assistants: string[] }[];
			}[];
		};
	};
	rhythm: {
		title: string;
		schedule: { day: string; description: string }[];
		participation: {
			title: string;
			steps: string[];
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
};

export const translations: Record<string, Translations> = {
	en: {
		layout: {
			nav: {
				home: "Home",
				about: "About",
				sections: "Sections",
				activities: "Activities",
				gallery: "Gallery",
				join: "Join Us",
				contact: "Contact",
			},
			groupTagline: "Scout Des Cedres",
			groupName: "Saint Jean Marc",
			footerMission: "Growing together in adventure, service, and faith.",
			footerSchedule: "Meetings every Saturday afternoon",
			footerContact: "Contact us: info@sdcsaintjeanmarc.org",
			languageToggle: {
				label: "Language",
				english: "EN",
				arabic: "AR",
			},
		},
		home: {
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
		},
		about: {
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
					},
					{
						year: "1975",
						title: "First international camp",
						description: "Patrols travel to France, forging lasting scout friendships across borders.",
					},
					{
						year: "2003",
						title: "Service expansion",
						description: "Community partnerships multiply, adding monthly projects for every age group.",
					},
					{
						year: "Today",
						title: "Four thriving sections",
						description: "Castors through Pionniers gather weekly with more than 20 volunteer leaders.",
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
			leadership: {
				title: "Meet our leadership team",
				items: [
					{
						id: "chef-group",
						name: "Marie El Khoury",
						role: "Chef de groupe",
						bio: "Guides the entire troop, mentors leaders, and ensures every program stays true to our mission.",
						photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "assistant-chef",
						name: "Joseph Farah",
						role: "Assistant chef de groupe",
						bio: "Supports logistics and high-adventure programming, bringing engineering precision to every camp.",
						photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "secretary",
						name: "Lina Saade",
						role: "Secretary (Amin Serr)",
						bio: "Keeps parent communication flowing and archives the troop’s memories and milestones.",
						photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "treasurer",
						name: "Karim Boulos",
						role: "Treasurer (Amin Sandouq)",
						bio: "Oversees budgets and fundraising so every scout can participate fully.",
						photo: "https://images.unsplash.com/photo-1502767089025-6572583495b4?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "quartermaster",
						name: "Elie Matar",
						role: "Quartermaster (Amin Tajhizet)",
						bio: "Maintains gear, transportation, and safety kits for every outing.",
						photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "operations-lead",
						name: "Nour Chidiac",
						role: "Administrative lead",
						bio: "Coordinates calendars, permissions, and training so volunteers stay aligned.",
						photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "castors-lead",
						name: "Rami Chbat",
						role: "Castors unit leader",
						bio: "Introduces our youngest scouts to simple adventures and playful prayer.",
						photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "castors-assistant",
						name: "Nadine Fakhry",
						role: "Castors assistant",
						bio: "Designs crafts and songs that keep curiosity alive.",
						photo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "louveteaux-lead",
						name: "Anthony Rizk",
						role: "Louveteaux unit leader",
						bio: "Builds teamwork through patrol games and first overnight experiences.",
						photo: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "louveteaux-assistant",
						name: "Yara Saab",
						role: "Louveteaux assistant",
						bio: "Coaches songs, skits, and service badges for the pack.",
						photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "guides-lead",
						name: "Lea Daher",
						role: "Guides unit leader",
						bio: "Accompanies our Mourchidat through identity-forming outdoor journeys.",
						photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "guides-assistant",
						name: "Clara Abboud",
						role: "Guides assistant",
						bio: "Leads prayer circles and reflection moments around the campfire.",
						photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "flowers-lead",
						name: "Maya Tannous",
						role: "Zahrat unit leader",
						bio: "Helps Zaharat discover service through art, dance, and nature walks.",
						photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "flowers-assistant",
						name: "Julie Nasr",
						role: "Zahrat assistant",
						bio: "Organizes ceremonies and badge tracking for the floral patrols.",
						photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "rovers-lead",
						name: "Omar Khoury",
						role: "Jawala unit leader",
						bio: "Mentors Jouwele in leadership rotations and trek planning.",
						photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "rovers-assistant",
						name: "Sami Abou Khalil",
						role: "Jawala assistant",
						bio: "Handles equipment checks and emergency drills for the rovers.",
						photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "pioneers-lead",
						name: "Christelle Nassar",
						role: "Mounjidet unit leader",
						bio: "Accompanies senior scouts through discernment, service expeditions, and faith formation.",
						photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "pioneers-assistant-1",
						name: "Hiba Gerges",
						role: "Mounjidet assistant",
						bio: "Coordinates formation weekends and service partnerships for the unit.",
						photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "pioneers-assistant-2",
						name: "Ranya Fadel",
						role: "Mounjidet assistant",
						bio: "Supports leadership coaching and accompanies international exchanges.",
						photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
					},
				],
				orgChart: {
					rows: [
						{
							label: "Group leadership",
							highlight: true,
							nodes: [{ leader: "chef-group", assistants: ["assistant-chef"] }],
						},
						{
							label: "Administrative team",
							nodes: [
								{ leader: "secretary", assistants: [] },
								{ leader: "treasurer", assistants: [] },
								{ leader: "quartermaster", assistants: [] },
								{ leader: "operations-lead", assistants: [] },
							],
						},
						{
							label: "Section leaders",
							compact: true,
							nodes: [
								{ leader: "castors-lead", assistants: ["castors-assistant"] },
								{ leader: "louveteaux-lead", assistants: ["louveteaux-assistant"] },
								{ leader: "guides-lead", assistants: ["guides-assistant"] },
								{ leader: "flowers-lead", assistants: ["flowers-assistant"] },
								{ leader: "rovers-lead", assistants: ["rovers-assistant"] },
								{ leader: "pioneers-lead", assistants: ["pioneers-assistant-1", "pioneers-assistant-2"] },
							],
						},
					],
				},
			},
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
		},
	},
	ar: {
		layout: {
			nav: {
				home: "الرئيسية",
				about: "من نحن",
				sections: "الفروع",
				activities: "الأنشطة",
				gallery: "المعرض",
				join: "انضموا إلينا",
				contact: "تواصل معنا",
			},
			groupTagline: "فوج كشفي",
			groupName: "سان جان مارك",
			footerMission: "ننمو معاً في المغامرة والخدمة والإيمان.",
			footerSchedule: "نلتقي كل سبت بعد الظهر",
			footerContact: "تواصلوا معنا: info@sdcsaintjeanmarc.org",
			languageToggle: {
				label: "اللغة",
				english: "إنجليزي",
				arabic: "عربي",
			},
		},
		home: {
			hero: {
				badge: "كشافة فرنسا",
				title: "أهلاً بكم في كشافة سان جان مارك",
				description:
					"عائلة كشفية نابضة بالحياة تساعد الأطفال واليافعين على النمو من خلال المغامرة والخدمة والصداقة. انضموا إلينا لتكتشفوا متعة الكشافة في جو دافئ مليء بالإيمان.",
				primaryCta: "انضموا إلى فوجنا",
				secondaryCta: "تعرّفوا على فروعنا",
				heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80",
			},
			whoWeAre: {
				title: "من نحن",
				paragraphs: [
					"يفتح فوج سان جان مارك أبوابه للشباب من كل الخلفيات. تحت إشراف قادة ذوي خبرة، نساعد كل كشاف على تنمية الثقة بالنفس والإيمان والمسؤولية، مع عيش مغامرات لا تُنسى.",
					"من المخيمات الأسبوعية إلى خدمة المجتمع، صُممت كل نشاطاتنا لتشعل الفضول وتنمّي المهارات وتبني صداقات تدوم مدى الحياة.",
				],
				highlights: {
					mission: {
						title: "رسالتنا",
						description: "نساند العائلات بتقديم مساحة للشباب كي ينموا ويخدموا ويقودوا بفرح.",
					},
					rhythm: {
						title: "إيقاعنا الأسبوعي",
						description: "نجتمع عصر كل سبت في قاعة الرعية، مع طلعات شهرية ونشاطات خاصة.",
					},
					service: {
						title: "إيمان وخدمة",
						description: "نعيش القانون الكشفي وندعم مجتمعنا بأعمال خدمة صغيرة وكبيرة.",
					},
					leadership: {
						title: "قيادة",
						description: "يُرشد الكشافون الأكبر سناً الفروع الأصغر، فينمون هم أيضاً كقادة.",
					},
				},
			},
			sections: {
				title: "فروعنا",
				subtitle: "كل فئة عمرية تتبع برنامجاً يناسب مراحل نموها.",
				cta: "تعرّفوا على جميع الفروع →",
				items: [
					{
						name: "القنادس",
						ageRange: "الأعمار 6 – 8",
						description: "مغامرات مرِحة وخطوات أولى في الكشافة من خلال الألعاب والأناشيد والتحديات البسيطة.",
						color: "from-emerald-500 to-emerald-700",
					},
					{
						name: "الذئاب الصغار",
						ageRange: "الأعمار 8 – 11",
						description: "نكتشف روح العمل الجماعي والإبداع والطبيعة عبر المخيمات والرحلات الممتعة.",
						color: "from-lime-400 to-emerald-500",
					},
					{
						name: "الكشافة",
						ageRange: "الأعمار 11 – 14",
						description: "نبني الثقة بالنفس ونتعلم مهارات الحياة في الهواء الطلق ونكوّن صداقات قوية.",
						color: "from-teal-500 to-emerald-600",
					},
					{
						name: "الروّاد",
						ageRange: "الأعمار 14 – 17",
						description: "نقود مشاريع خدمية، نستكشف العالم، ونعيش قيم الكشافة بعملٍ ملموس.",
						color: "from-emerald-600 to-green-800",
					},
				],
			},
			activities: {
				title: "أنشطتنا القادمة",
				subtitle: "أبرز فعالياتنا خلال الفصل الأول.",
				cta: "اطلعوا على التقويم الكامل →",
				items: [
					{
						slug: "family-welcome-campfire",
						title: "أمسية نار المخيم الترحيبية",
						date: "14 أيلول 2024",
						description: "أغانٍ وألعاب ولقاء مع القادة لافتتاح السنة الكشفية الجديدة.",
						location: "حديقة سان جان",
						datetime: "2024-09-14T18:00:00+03:00",
						endTime: "2024-09-14T21:00:00+03:00",
						image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
						section: "كل الفروع",
						highlights: [
							"أغاني ونشاطات حول النار لاستقبال العائلات الجديدة",
							"جلسة تعارف وأسئلة وأجوبة مع القادة",
							"ألعاب تعارف لكل الفئات العمرية",
						],
						gear: ["عبوة ماء قابلة لإعادة التعبئة", "كرسي تخييم أو بطانية", "منديل الكشافة"],
						contact: "القائدة ماري · ‎+961 372 4473",
					},
					{
						slug: "autumn-skills-camp",
						title: "مخيم مهارات الخريف",
						date: "4 – 6 تشرين الأول 2024",
						description: "نهاية أسبوع نركّز فيها على الطهي في الهواء الطلق والفنون الكشفية وتحديات العمل الجماعي.",
						location: "مخيم لاك فير",
						datetime: "2024-10-04T17:00:00+03:00",
						endTime: "2024-10-06T12:00:00+03:00",
						image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
						section: "الكشافة والرواد",
						highlights: ["إعداد المخيم ومختبرات الطهي في الطبيعة", "تحدي الملاحة الليلية بين الأرز", "قداس واختتام مع الأهل نهار الأحد"],
						gear: ["حقيبة تخييم كاملة", "كيس نوم ثلاثي المواسم", "حذاء مشي وجاكيت مقاوم للمطر"],
						contact: "القائد جوزيف · ‎+961 711 554 892",
					},
					{
						slug: "community-service-day",
						title: "يوم الخدمة المجتمعية",
						date: "9 تشرين الثاني 2024",
						description: "تجتمع كل الفروع لدعم حيّنا عبر سلسلة من مشاريع الخدمة.",
						location: "المركز المجتمعي",
						datetime: "2024-11-09T09:00:00+03:00",
						endTime: "2024-11-09T15:00:00+03:00",
						image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1600&q=80",
						section: "كل الفروع",
						highlights: ["تنظيف الحي وتشجير الزوايا العامة", "القنادس يصنعون بطاقات للمسنين في الرعية", "غداء ساخن من إعداد لجنة الأهل"],
						gear: ["قفازات عمل", "عبوة ماء شخصية", "قميص أو منديل الفرقة"],
						contact: "القائدة سارة · ‎+961 702 220 456",
					},
					{
						slug: "winter-leadership-hike",
						title: "مسير القيادة الشتوي",
						date: "7 كانون الأول 2024",
						description: "الكشافة المتقدمون يخوضون مسيراً جبلياً للتركيز على القيادة والتجهيز لموسم الشتاء.",
						location: "محمية أرز الشوف",
						datetime: "2024-12-07T08:00:00+02:00",
						endTime: "2024-12-07T17:00:00+02:00",
						image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
						section: "الرواد",
						highlights: [
							"محطات قيادة بالتناوب مع تقييم من القادة",
							"ورش بناء مأوى شتوي واستعمال مواقد الغاز",
							"لحظات تأمل فردية مطلّة على وديان الأرز",
						],
						gear: ["حقيبة ظهر مع ملابس طبقات", "عصي مشي", "ترمس مع مشروب ساخن"],
						contact: "القائد أنطوان · ‎+961 356 9911",
					},
				],
			},
			gallery: {
				title: "لمحات من المعرض",
				subtitle: "لحظات تجسد روح الكشافة.",
				cta: "شاهدوا المعرض →",
				items: [
					{
						title: "نزهة في الغابة",
						description: "نستكشف مساراتنا المفضّلة معاً.",
						background: "bg-gradient-to-br from-emerald-200 via-emerald-50 to-slate-100",
					},
					{
						title: "أغاني النار",
						description: "أصواتنا تتوحد تحت النجوم.",
						background: "bg-gradient-to-br from-amber-200 via-orange-50 to-slate-100",
					},
					{
						title: "مشروع خدمة",
						description: "نخدم مجتمعنا بكل فخر.",
						background: "bg-gradient-to-br from-teal-200 via-emerald-50 to-slate-100",
					},
					{
						title: "عطلة نهاية أسبوع مغامِرة",
						description: "تحديات جماعية تبني صداقات تدوم.",
						background: "bg-gradient-to-br from-lime-200 via-emerald-50 to-slate-100",
					},
				],
			},
			highlightStrip: {
				nextEventLabel: "النشاط القادم",
				stats: [
					{ value: "80+", label: "كشاف نشط" },
					{ value: "20", label: "قائد متطوع" },
				],
			},
			testimonial: {
				title: "شهادات من الأهالي",
				items: [
					{
						quote: '"أعاد لنا فوج سان جان مارك روح الجماعة. أولادنا اكتسبوا ثقة بالنفس وحب الخدمة، ونعود كل أسبوع محمّلين بالفرح."',
						author: "ريتا أ.",
						role: "والدة كشاف",
					},
					{
						quote: '"القادة يهتمون بكل التفاصيل. ابننا أصبح يبادر بخدمة الرعية لأنه تعلّم قيمة العطاء في الفوج."',
						author: "مارك ل.",
						role: "والد قندس",
					},
					{
						quote: '"نشعر أننا ضمن عائلة حقيقية. المخيمات والصلوات والمشاريع كلها منظمة بإتقان ونثق بالفريق بالكامل."',
						author: "ناديا س.",
						role: "والدة رائد",
					},
				],
			},
			callToAction: {
				title: "جاهزون لبدء المغامرة؟",
				description:
					"انضموا إلى عائلتنا الكشفية الدافئة، وتعرّفوا على قادة ملهمين، واكتشفوا تجارب تصنع أثراً في حياة أولادكم. نحن بانتظاركم!",
				primaryCta: "اطلبوا ملف المعلومات",
				secondaryCta: "تحدثوا مع قائد",
			},
		},
		about: {
			hero: {
				badge: "قصتنا",
				title: "متجذرون في الإيمان، ننمو بالمغامرة",
				description: "منذ عام 1957، يرحّب فوج سان جان مارك بالشباب ليكتشفوا القيادة والخدمة والصداقة من خلال فرح الحياة الكشفية.",
				image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
			},
			history: {
				title: "محطات صنعت مسيرتنا",
				timeline: [
					{
						year: "1957",
						title: "التأسيس",
						description: "أطلق قادة الرعية الفوج ليقدّموا مساحة آمنة للشباب.",
					},
					{
						year: "1975",
						title: "أول مخيم دولي",
						description: "سافرت الطلائع إلى فرنسا ونسجت صداقات كشفية عابرة للحدود.",
					},
					{
						year: "2003",
						title: "توسّع الخدمة",
						description: "تضاعفت الشراكات الاجتماعية وأضفنا مشاريع شهرية لكل الفروع.",
					},
					{
						year: "اليوم",
						title: "أربعة فروع مزدهرة",
						description: "من القنادس إلى الروّاد يجتمع أكثر من 20 قائد متطوع أسبوعياً.",
					},
				],
			},
			pillars: {
				title: "مرتكزات كل برنامج",
				items: [
					{
						title: "إيمان نعيشه معاً",
						description: "صلاة وقداس وتأملات تتخلل كل مخيم وزيارة خدمة.",
					},
					{
						title: "خدمة من القلب",
						description: "تنظيف أحياء، دعم للرعية، ومبادرات تضامن شهرية لكل الأعمار.",
					},
					{
						title: "مغامرة هادفة",
						description: "مهارات ميدانية ومخيمات وتحديات تبني الشجاعة وروح الفريق.",
					},
					{
						title: "قيادة تنمو",
						description: "الكشافة الأكبر يرافقون الأصغر منهم ويتعلمون القيادة بتواضع.",
					},
				],
			},
			leadership: {
				title: "تعرفوا على فريق القيادة",
				items: [
					{
						id: "chef-group",
						name: "ماري الخوري",
						role: "قائدة الفوج",
						bio: "تقود العمل التربوي وترافق القادة لضمان انسجام البرامج مع رسالتنا.",
						photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "assistant-chef",
						name: "جوزيف فرح",
						role: "مساعد قائد الفوج",
						bio: "يهتم بالمخيمات واللوجستيات ويضمن جودة المغامرات الهادفة.",
						photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "secretary",
						name: "لينا سعادة",
						role: "أمين سر",
						bio: "تعتني بالتواصل مع الأهل وتوثيق نشاطات الفوج.",
						photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "treasurer",
						name: "كريم بعلبكي",
						role: "أمين صندوق",
						bio: "يدير الميزانيات والحملات الداعمة لضمان مشاركة الجميع.",
						photo: "https://images.unsplash.com/photo-1502767089025-6572583495b4?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "quartermaster",
						name: "إيلي مطر",
						role: "أمين تجهيزات",
						bio: "يشرف على العتاد والسلامة والنقل لكل الطلعات.",
						photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "operations-lead",
						name: "نور شديد",
						role: "قائد إداري",
						bio: "ينسّق الجداول، الاستمارات، ودورات التكوين للقادة.",
						photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "castors-lead",
						name: "رامي شبط",
						role: "قائد فرقة الكشفة",
						bio: "يعرف الصغار على المغامرة البسيطة والصلاة المرحة.",
						photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "castors-assistant",
						name: "نادين فخري",
						role: "مساعدة فرقة الكشفة",
						bio: "تحضر الأشغال اليدوية والأناشيد التي تفتح خيال الأطفال.",
						photo: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "louveteaux-lead",
						name: "أنطوني رزق",
						role: "قائد فرقة الجرميز",
						bio: "يرافق الجرميز في ألعاب الطليعة وأول مخيم ليلي.",
						photo: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "louveteaux-assistant",
						name: "يارا صعب",
						role: "مساعدة الجرميز",
						bio: "تهتم بالأناشيد والشارات وبناء روح الفريق.",
						photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "guides-lead",
						name: "ليا ضاهر",
						role: "قائدة المرشدات",
						bio: "ترافق المرشدات في المخيمات التكوينية وتأملات المساء.",
						photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "guides-assistant",
						name: "كلارا عبود",
						role: "مساعدة المرشدات",
						bio: "تحضر حلقات المشاركة والصلوات حول النار.",
						photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "flowers-lead",
						name: "ميا طنوس",
						role: "قائدة الزهرات",
						bio: "تزرع حب الخدمة عبر الفن والرقص والطبيعة.",
						photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "flowers-assistant",
						name: "جولي نصر",
						role: "مساعدة الزهرات",
						bio: "تنظم الاحتفالات وتتابع الشارات مع العائلات.",
						photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "rovers-lead",
						name: "عمر خوري",
						role: "قائد الجوالة",
						bio: "يدرّب الجوالة على قيادة الرحلات والمشاريع.",
						photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "rovers-assistant",
						name: "سامي أبو خليل",
						role: "مساعد الجوالة",
						bio: "يهتم بالتجهيزات والتدريب الطارئ في طلعات الجوالة.",
						photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "pioneers-lead",
						name: "كريستيل نصر",
						role: "قائدة المنجدات",
						bio: "ترافق المنجدات في مسيرة الرسالة والخدمة الدولية.",
						photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "pioneers-assistant-1",
						name: "هبة جرجس",
						role: "مساعدة المنجدات",
						bio: "تنسّق لقاءات التكوين وخدمة المجتمع مع الشابات.",
						photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
					},
					{
						id: "pioneers-assistant-2",
						name: "رنيا فاضل",
						role: "مساعدة المنجدات",
						bio: "تواكب التحضيرات للمخيمات الطويلة والزيارات الخارجية.",
						photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
					},
				],
				orgChart: {
					rows: [
						{
							label: "قيادة الفوج",
							highlight: true,
							nodes: [{ leader: "chef-group", assistants: ["assistant-chef"] }],
						},
						{
							label: "الفريق الإداري",
							nodes: [
								{ leader: "secretary", assistants: [] },
								{ leader: "treasurer", assistants: [] },
								{ leader: "quartermaster", assistants: [] },
								{ leader: "operations-lead", assistants: [] },
							],
						},
						{
							label: "قادة الفروع",
							compact: true,
							nodes: [
								{ leader: "castors-lead", assistants: ["castors-assistant"] },
								{ leader: "louveteaux-lead", assistants: ["louveteaux-assistant"] },
								{ leader: "guides-lead", assistants: ["guides-assistant"] },
								{ leader: "flowers-lead", assistants: ["flowers-assistant"] },
								{ leader: "rovers-lead", assistants: ["rovers-assistant"] },
								{ leader: "pioneers-lead", assistants: ["pioneers-assistant-1", "pioneers-assistant-2"] },
							],
						},
					],
				},
			},
			rhythm: {
				title: "إيقاع الأسبوع وكيفية المشاركة",
				schedule: [
					{ day: "السبت 2:00 بعد الظهر", description: "القنادس والذئاب يلتقون في قاعة الرعية." },
					{ day: "السبت 4:30 بعد الظهر", description: "الكشافة والرواد يجتمعون لأنشطة الطلائع." },
					{ day: "طلعات شهرية", description: "تتبادل الفروع المخيمات، الرحلات، والخدمة." },
				],
				participation: {
					title: "كيف تنضمون إلى العائلة",
					steps: [
						"زوروا اجتماع السبت وتعرفوا على القادة.",
						"شاركوا في لقاء الأهل للتعرف على برنامج السنة.",
						"سجلوا أولادكم أو تطوعوا ضمن فريق الدعم.",
					],
				},
			},
			impact: {
				title: "أثر السنة الماضية",
				stats: [
					{ label: "ساعات خدمة", value: "1,200+" },
					{ label: "مخيمات كبرى", value: "6" },
					{ label: "عائلات مرافقة", value: "95" },
				],
			},
			faq: {
				title: "أسئلة متكررة",
				items: [
					{
						question: "ما هي الأعمار المقبولة؟",
						answer: "القنادس من عمر 6 سنوات والرواد حتى 17 سنة، ونساعد العائلات في اختيار الفرع المناسب.",
					},
					{
						question: "هل نحتاج خبرة سابقة؟",
						answer: "أبداً، التكوين يحصل خلال الأنشطة، والكبار يرافقون الصغار خطوة بخطوة.",
					},
					{
						question: "كم تبلغ الكلفة؟",
						answer: "الاشتراك السنوي رمزي ونوفر الدعم لعائلات تحتاجه، والمخيمات لها رسم منفصل لكن لا يُرفض أي ولد.",
					},
					{
						question: "كيف نضمن السلامة؟",
						answer: "كل القادة مدرّبون، يخضعون للتدقيق اللازم، ولكل نشاط خطة طوارئ واتباع صارم لإرشادات الحماية.",
					},
				],
			},
			callToAction: {
				title: "امشوا معنا",
				description: "سواء كنتم عائلة جديدة، أو من قدماء الفوج، أو ترغبون بالتطوع، لديكم مكان في قصة سان جان مارك.",
				primaryCta: "نسّقوا زيارة",
				secondaryCta: "تحدثوا مع قائد",
			},
		},
	},
};
