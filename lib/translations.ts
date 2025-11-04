export type SectionContent = {
	name: string;
	ageRange: string;
	description: string;
	color: string;
};

export type ActivityContent = {
	title: string;
	date: string;
	description: string;
	location: string;
};

export type GalleryContent = {
	title: string;
	description: string;
	background: string;
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
        heroImage:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80",
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
						name: "Castors",
						ageRange: "Ages 6 – 8",
						description: "Playful adventures and first steps into scouting through games, songs, and simple challenges.",
						color: "from-emerald-500 to-emerald-700",
					},
					{
						name: "Louveteaux",
						ageRange: "Ages 8 – 11",
						description: "Discovering teamwork, creativity, and nature through camps and fun-filled outings.",
						color: "from-lime-400 to-emerald-500",
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
						title: "Family Welcome Campfire",
						date: "September 14",
						description: "An evening of songs, games, and meeting the leaders to kick off the scouting year.",
						location: "Parc Saint Jean",
					},
					{
						title: "Autumn Skills Camp",
						date: "October 4 – 6",
						description: "Weekend camp focusing on outdoor cooking, pioneering, and teamwork challenges.",
						location: "Camp Lac Vert",
					},
					{
						title: "Community Service Day",
						date: "November 9",
						description: "All sections unite to support our neighborhood through a day of helpful service projects.",
						location: "Community Center",
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
			callToAction: {
				title: "Ready to Start the Adventure?",
				description:
					"Join our welcoming scout family, meet inspiring leaders, and discover experiences that will shape your child for life. We can’t wait to meet you!",
				primaryCta: "Get Information Pack",
				secondaryCta: "Talk with a Leader",
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
        heroImage:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1500&q=80",
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
						title: "أمسية نار المخيم الترحيبية",
						date: "14 أيلول",
						description: "أغانٍ وألعاب ولقاء مع القادة لافتتاح السنة الكشفية الجديدة.",
						location: "حديقة سان جان",
					},
					{
						title: "مخيم مهارات الخريف",
						date: "4 – 6 تشرين الأول",
						description: "نهاية أسبوع نركّز فيها على الطهي في الهواء الطلق والفنون الكشفية وتحديات العمل الجماعي.",
						location: "مخيم لاك فير",
					},
					{
						title: "يوم الخدمة المجتمعية",
						date: "9 تشرين الثاني",
						description: "تجتمع كل الفروع لدعم حيّنا عبر سلسلة من مشاريع الخدمة.",
						location: "المركز المجتمعي",
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
			callToAction: {
				title: "جاهزون لبدء المغامرة؟",
				description:
					"انضموا إلى عائلتنا الكشفية الدافئة، وتعرّفوا على قادة ملهمين، واكتشفوا تجارب تصنع أثراً في حياة أولادكم. نحن بانتظاركم!",
				primaryCta: "اطلبوا ملف المعلومات",
				secondaryCta: "تحدثوا مع قائد",
			},
		},
	},
};
