import { leadershipAr } from "@/lib/content/shared/leadership/ar";
import type { SectionsPageContent } from "@/lib/translations";

const leaderProfiles = leadershipAr.items.reduce<Record<string, { name: string; avatar: string }>>((acc, leader) => {
	acc[leader.id] = { name: leader.name, avatar: leader.photo };
	return acc;
}, {});

const pickLeader = (id: string) => {
	const profile = leaderProfiles[id];
	return {
		name: profile?.name ?? id,
		avatar:
			profile?.avatar ??
			"https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
	};
};

export const sectionsPageAr: SectionsPageContent = {
	hero: {
		badge: "الفروع",
		title: "مسار واضح لكل فئة",
		description: "من الجرميز إلى المنجدات، كل فرع يساعد أبناءنا على النمو عبر تحديات وخدمة ومغامرة تناسب عمرهم.",
		image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
		cta: "حمّلوا دليل البرنامج",
		ctaLink: "/docs/program-guide.pdf",
	},
	overview: {
		text: "ستة فروع تشكّل عائلة واحدة. اكتشفوا كيف ننظم كل فرع وتعرّفوا على القادة الذين يرافقون أولادكم أسبوعياً.",
		stats: [
			{ value: "6", label: "فروع نشطة", icon: "campfire" },
			{ value: "24", label: "قائد فرعي", icon: "community" },
			{ value: "80+", label: "كشاف مشارك", icon: "calendar" },
		],
	},
	sections: [
		{
			id: "louveteaux",
			name: "الجرميز",
			ageRange: "الأعمار 8 – 11",
			motto: "دائماً مستعد",
			description: "ألعاب الطليعة، أول المخيمات الليلية، وشارات الخدمة تبني روح الفريق والخيال.",
			meeting: "السبت · 2:00 بعد الظهر · قاعة الرعية",
			image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
			focus: ["حياة الطليعة", "لحظات صلاة", "أشغال يدوية"],
		leadership: {
			chief: pickLeader("louveteaux-lead"),
			assistants: [pickLeader("louveteaux-assistant")],
				patrols: [
					{
						name: "مجموعة سان جان",
						leader: "كريم شديّاق",
						assistant: "نور معلوف",
						members: ["إلياس", "مارك", "رامي", "داليا"],
					},
					{
						name: "طلائع سان لويس",
						leader: "أنطوني جرجي",
						assistant: "ريتا شديد",
						members: ["جاد", "نايلا", "فارس", "مريم"],
					},
					{
						name: "طلائع جان دارك",
						leader: "توني فرح",
						assistant: "ميرا أبو خليل",
						members: ["ليا", "صوفيا", "بول", "يوسف"],
					},
				],
			},
		},
		{
			id: "jeannettes",
			name: "المرشدات الصغيرات",
			ageRange: "الأعمار 8 – 11",
			motto: "خدمة بفرح",
			description: "قصص، أعمال فنية، وأناشيد تشجّع الخيال وروح الخدمة.",
			meeting: "السبت · 2:00 بعد الظهر · قاعة الأنشطة",
			image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
			focus: ["أشغال فنية", "خدمة اجتماعية", "أناشيد"],
			leadership: {
				chief: pickLeader("flowers-lead"),
				assistants: [pickLeader("flowers-assistant")],
				patrols: [
					{
						name: "فرقة سيدة العجائب",
						leader: "كلوديا رزق",
						assistant: "بيرلا فرزلي",
						members: ["إلسا", "ماريا", "إيزابيل", "نور"],
					},
					{
						name: "فرقة القديسة ريتا",
						leader: "لين سعد",
						assistant: "جيسي تابت",
						members: ["سارة", "تالا", "رانية", "كارلا"],
					},
				],
			},
		},
		{
			id: "scouts",
			name: "الكشافة",
			ageRange: "الأعمار 12 – 14",
			motto: "كن مستعداً",
			description: "يتدرّبون على البناء الكشفي، الملاحة، ومخيمات نهاية الأسبوع التي تعزز الشجاعة.",
			meeting: "السبت · 4:30 بعد الظهر · الحقل الخارجي",
			image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
			focus: ["بناء كشفي", "ملاحة", "مشاريع خدمة"],
			leadership: {
				chief: pickLeader("rovers-lead"),
				assistants: [pickLeader("rovers-assistant")],
				patrols: [
					{
						name: "طلائع سان جوزف",
						leader: "جورج نصار",
						assistant: "إيلي أبي حيلى",
						members: ["كريم", "ميشال", "روي", "شربل"],
					},
					{
						name: "طلائع الأرز",
						leader: "رالف يوسف",
						assistant: "وليد فرحات",
						members: ["زياد", "نبيل", "أدريان", "طوني"],
					},
				],
			},
		},
		{
			id: "guides",
			name: "المرشدات",
			ageRange: "الأعمار 12 – 14",
			motto: "معاً إلى الأمام",
			description: "مخيمات تكوينية، خدمة ليتورجية، ومغامرات في الطبيعة تبني الأخوّة والإيمان.",
			meeting: "السبت · 4:30 بعد الظهر · القاعة العليا",
			image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1200&q=80",
			focus: ["قيادة", "مشاركة روحية", "رحلات"],
			leadership: {
				chief: pickLeader("guides-lead"),
				assistants: [pickLeader("guides-assistant")],
				patrols: [
					{
						name: "فرقة القديسة رفقا",
						leader: "كريستي عازار",
						assistant: "جويل مسعود",
						members: ["مايا", "ساندرا", "كريستينا", "هيلينا"],
					},
					{
						name: "فرقة العذراء",
						leader: "ريتا سليمان",
						assistant: "إلسا ضاهر",
						members: ["نور", "ميرا", "بولا", "رشا"],
					},
				],
			},
		},
		{
			id: "routiers",
			name: "الجوالة",
			ageRange: "الأعمار 15 – 17",
			motto: "خدمة وقيادة",
			description: "رحلات طويلة، مرافقة الفروع الأصغر، وخلوات تمييز روحي.",
			meeting: "الجمعة · 7:00 مساءً · بيت الرعية",
			image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
			focus: ["رحلات", "مرافقة", "تمييز دعوي"],
			leadership: {
				chief: pickLeader("rovers-lead"),
				assistants: [pickLeader("rovers-assistant")],
				patrols: [
					{
						name: "عشيرة سان جورج",
						leader: "فيليب خوري",
						assistant: "جوزف عزي",
						members: ["فادي", "بشارة", "شربل", "سامي"],
					},
					{
						name: "عشيرة سان بول",
						leader: "مالك شلحود",
						assistant: "زياد أنطون",
						members: ["أمين", "حسن", "إلياس", "هادي"],
					},
				],
			},
		},
		{
			id: "caravelles",
			name: "المنجدات",
			ageRange: "الأعمار 15 – 17",
			motto: "رجاء جريء",
			description: "خدمة دولية، رسالات رعوية، ومختبرات تكوين تحضّرهن لمرحلة الشباب.",
			meeting: "الجمعة · 7:00 مساءً · السطح",
			image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
			focus: ["خدمة دولية", "خدمة ليتورجية", "إدارة مشاريع"],
			leadership: {
				chief: pickLeader("pioneers-lead"),
				assistants: [pickLeader("pioneers-assistant-1"), pickLeader("pioneers-assistant-2")],
				patrols: [
					{
						name: "موقد القديسة ريتا",
						leader: "كريستيل كرم",
						assistant: "ياسمينا صفير",
						members: ["ليال", "سابين", "غابرييل", "ماريا"],
					},
					{
						name: "موقد القديسة كلير",
						leader: "رنا فخري",
						assistant: "لينا ضاهر",
						members: ["بيرلا", "نادين", "سيلين", "فيكي"],
					},
					{
						name: "موقد القديسة برناديت",
						leader: "سارة بو غصن",
						assistant: "جوانا رحمة",
						members: ["فرح", "إليسا", "ألين", "باميلا"],
					},
				],
			},
		},
	],
	faq: [
		{
			question: "ما هي الأعمار المقبولة؟",
			answer: "كل فرع يستقبل فئة عمرية محددة، وسنرشدكم إلى المكان الأنسب.",
		},
		{
			question: "هل الزيّ إلزامي؟",
			answer: "نعم، نقدّم لائحة حسب الفرع، ولدينا صندوق خاص لدعم العائلات عند الحاجة.",
		},
		{
			question: "ما معنى الطلائع؟",
			answer: "الطليعة تضم قائداً، مساعداً، وأعضاء يتناوبون على المهام ويخططون للخدمة والنمو طوال السنة.",
		},
		{
			question: "هل يمكن أن يشارك الإخوة في فروع مختلفة؟",
			answer: "بالتأكيد، فقد نسّقنا الأوقات بحيث يمكن للعائلات خدمة أكثر من فرع بسهولة.",
		},
	],
cta: {
	title: "جاهزون لزيارة أحد الفروع؟",
	description: "نسقوا زيارة يوم السبت، تعرّفوا على قائد الفرع، واكتشفوا كيف يمكن للكشافة أن تغيّر حياة أولادكم.",
	primary: "احجزوا زيارة",
	secondary: "تواصلوا مع قائد",
},
	};
