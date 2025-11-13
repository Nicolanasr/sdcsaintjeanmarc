import { leadershipDefinition } from "@/lib/content/shared/leadership/data";
import type { Locale, LocalizedString } from "@/lib/content/shared/localized";
import { pickLocalized } from "@/lib/content/shared/localized";
import type { SectionsPageContent } from "@/lib/translations";

type PatrolDefinition = {
	name: LocalizedString;
	leader: LocalizedString;
	assistant: LocalizedString;
	members: LocalizedString[];
};

type SectionDefinition = {
	id: string;
	name: LocalizedString;
	ageRange: LocalizedString;
	motto: LocalizedString;
	description: LocalizedString;
	meeting: LocalizedString;
	image: string;
	focus: LocalizedString[];
	leadership: {
		chiefId: string;
		assistantIds: string[];
		patrols: PatrolDefinition[];
	};
};

const defaultAvatar = "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80";

const member = (en: string, ar: string): LocalizedString => ({ en, ar });

const sectionsDefinition: SectionDefinition[] = [
	{
		id: "louveteaux",
		name: { en: "Louveteaux", ar: "الجرميز" },
		ageRange: { en: "Ages 8 – 11", ar: "الأعمار 8 – 11" },
		motto: { en: "Always ready", ar: "دائماً مستعد" },
		description: {
			en: "Playful patrol games, first overnight camps, and service badges help Louveteaux discover teamwork and imagination.",
			ar: "ألعاب الطليعة، أول المخيمات الليلية، وشارات الخدمة تبني روح الفريق والخيال.",
		},
		meeting: {
			en: "Saturday · 2:00 PM · Parish hall",
			ar: "السبت · 2:00 بعد الظهر · قاعة الرعية",
		},
		image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
		focus: [
			{ en: "Patrol life", ar: "حياة الطليعة" },
			{ en: "Faith moments", ar: "لحظات صلاة" },
			{ en: "Crafts", ar: "أشغال يدوية" },
		],
		leadership: {
			chiefId: "louveteaux-lead",
			assistantIds: ["louveteaux-assistant"],
			patrols: [
				{
					name: { en: "Meute Saint Jean", ar: "مجموعة سان جان" },
					leader: { en: "Karim Chidiac", ar: "كريم شديّاق" },
					assistant: { en: "Nour Maalouf", ar: "نور معلوف" },
					members: [member("Elias", "إلياس"), member("Marc", "مارك"), member("Rami", "رامي"), member("Dalia", "داليا")],
				},
				{
					name: { en: "Patrol Saint Louis", ar: "طلائع سان لويس" },
					leader: { en: "Anthony Gerges", ar: "أنطوني جرجي" },
					assistant: { en: "Rita Chedid", ar: "ريتا شديد" },
					members: [member("Jad", "جاد"), member("Nayla", "نايلا"), member("Fares", "فارس"), member("Myriam", "مريم")],
				},
				{
					name: { en: "Patrol Jeanne d'Arc", ar: "طلائع جان دارك" },
					leader: { en: "Toni Farah", ar: "توني فرح" },
					assistant: { en: "Mira Abou Khalil", ar: "ميرا أبو خليل" },
					members: [member("Lea", "ليا"), member("Sofia", "صوفيا"), member("Paul", "بول"), member("Youssef", "يوسف")],
				},
			],
		},
	},
	{
		id: "jeanettes",
		name: { en: "Jeannettes", ar: "المرشدات الصغيرات" },
		ageRange: { en: "Ages 8 – 11", ar: "الأعمار 8 – 11" },
		motto: { en: "Joyful service", ar: "خدمة بفرح" },
		description: {
			en: "Story-based gatherings, ateliers, and songs help Jeannettes grow in creativity and service.",
			ar: "قصص، أعمال فنية، وأناشيد تشجّع الخيال وروح الخدمة.",
		},
		meeting: {
			en: "Saturday · 2:00 PM · Studio room",
			ar: "السبت · 2:00 بعد الظهر · قاعة الأنشطة",
		},
		image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
		focus: [
			{ en: "Creative ateliers", ar: "أشغال فنية" },
			{ en: "Outreach", ar: "خدمة اجتماعية" },
			{ en: "Songs", ar: "أناشيد" },
		],
		leadership: {
			chiefId: "flowers-lead",
			assistantIds: ["flowers-assistant"],
			patrols: [
				{
					name: { en: "Ronde Notre Dame", ar: "فرقة سيدة العجائب" },
					leader: { en: "Claudia Rizk", ar: "كلوديا رزق" },
					assistant: { en: "Perla Ferzli", ar: "بيرلا فرزلي" },
					members: [member("Elsa", "إلسا"), member("Maria", "ماريا"), member("Isabelle", "إيزابيل"), member("Noor", "نور")],
				},
				{
					name: { en: "Ronde Saint Rita", ar: "فرقة القديسة ريتا" },
					leader: { en: "Lynn Saad", ar: "لين سعد" },
					assistant: { en: "Jessica Tabet", ar: "جيسي تابت" },
					members: [member("Sarah", "سارة"), member("Tala", "تالا"), member("Rania", "رانية"), member("Carla", "كارلا")],
				},
			],
		},
	},
	{
		id: "scouts",
		name: { en: "Scouts", ar: "الكشافة" },
		ageRange: { en: "Ages 12 – 14", ar: "الأعمار 12 – 14" },
		motto: { en: "Be prepared", ar: "كن مستعداً" },
		description: {
			en: "Scouts dive into pioneering, backcountry skills, and weekend camps that stretch courage and leadership.",
			ar: "يتدرّبون على البناء الكشفي، الملاحة، ومخيمات نهاية الأسبوع التي تعزز الشجاعة.",
		},
		meeting: {
			en: "Saturday · 4:30 PM · Field",
			ar: "السبت · 4:30 بعد الظهر · الحقل الخارجي",
		},
		image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
		focus: [
			{ en: "Pioneering", ar: "بناء كشفي" },
			{ en: "Navigation", ar: "ملاحة" },
			{ en: "Service projects", ar: "مشاريع خدمة" },
		],
		leadership: {
			chiefId: "scouts-lead",
			assistantIds: ["scouts-assistant"],
			patrols: [
				{
					name: { en: "Troop Saint Joseph", ar: "طلائع سان جوزف" },
					leader: { en: "Georges Nassar", ar: "جورج نصار" },
					assistant: { en: "Elie Abi Hayla", ar: "إيلي أبي حيلى" },
					members: [member("Karim", "كريم"), member("Michel", "ميشال"), member("Roy", "روي"), member("Charbel", "شربل")],
				},
				{
					name: { en: "Troop Cedars", ar: "طلائع الأرز" },
					leader: { en: "Ralph Youssef", ar: "رالف يوسف" },
					assistant: { en: "Walid Farhat", ar: "وليد فرحات" },
					members: [member("Ziad", "زياد"), member("Nabil", "نبيل"), member("Adrian", "أدريان"), member("Tony", "طوني")],
				},
			],
		},
	},
	{
		id: "guides",
		name: { en: "Guides", ar: "المرشدات" },
		ageRange: { en: "Ages 12 – 14", ar: "الأعمار 12 – 14" },
		motto: { en: "Forward together", ar: "معاً إلى الأمام" },
		description: {
			en: "Guides mix formation weekends, liturgy service, and nature treks to build sisterhood rooted in faith.",
			ar: "مخيمات تكوينية، خدمة ليتورجية، ومغامرات في الطبيعة تبني الأخوّة والإيمان.",
		},
		meeting: {
			en: "Saturday · 4:30 PM · Upper hall",
			ar: "السبت · 4:30 بعد الظهر · القاعة العليا",
		},
		image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1200&q=80",
		focus: [
			{ en: "Leadership", ar: "قيادة" },
			{ en: "Faith sharing", ar: "مشاركة روحية" },
			{ en: "Backpacking", ar: "رحلات" },
		],
		leadership: {
			chiefId: "guides-lead",
			assistantIds: ["guides-assistant"],
			patrols: [
				{
					name: { en: "Compagnie Sainte Rafqa", ar: "فرقة القديسة رفقا" },
					leader: { en: "Christy Azar", ar: "كريستي عازار" },
					assistant: { en: "Joelle Massoud", ar: "جويل مسعود" },
					members: [member("Maya", "مايا"), member("Sandra", "ساندرا"), member("Christina", "كريستينا"), member("Helena", "هيلينا")],
				},
				{
					name: { en: "Compagnie Notre Dame", ar: "فرقة العذراء" },
					leader: { en: "Rita Sleiman", ar: "ريتا سليمان" },
					assistant: { en: "Elsa Daher", ar: "إلسا ضاهر" },
					members: [member("Nour", "نور"), member("Mira", "ميرا"), member("Paula", "بولا"), member("Racha", "رشا")],
				},
			],
		},
	},
	{
		id: "routiers",
		name: { en: "Routiers", ar: "الجوالة" },
		ageRange: { en: "Ages 15 – 17", ar: "الأعمار 15 – 17" },
		motto: { en: "Serve and lead", ar: "خدمة وقيادة" },
		description: {
			en: "Routiers embrace longer expeditions, mentoring younger patrols, and discernment retreats.",
			ar: "رحلات طويلة، مرافقة الفروع الأصغر، وخلوات تمييز روحي.",
		},
		meeting: {
			en: "Friday · 7:00 PM · Community house",
			ar: "الجمعة · 7:00 مساءً · بيت الرعية",
		},
		image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
		focus: [
			{ en: "Expeditions", ar: "رحلات" },
			{ en: "Mentorship", ar: "مرافقة" },
			{ en: "Vocational discernment", ar: "تمييز دعوي" },
		],
		leadership: {
			chiefId: "rovers-lead",
			assistantIds: ["rovers-assistant"],
			patrols: [
				{
					name: { en: "Clan Saint Georges", ar: "عشيرة سان جورج" },
					leader: { en: "Philippe Khoury", ar: "فيليب خوري" },
					assistant: { en: "Joseph Azzi", ar: "جوزف عزي" },
					members: [member("Fadi", "فادي"), member("Bishara", "بشارة"), member("Charbel", "شربل"), member("Sami", "سامي")],
				},
				{
					name: { en: "Clan Saint Paul", ar: "عشيرة سان بول" },
					leader: { en: "Malek Chalhoub", ar: "مالك شلحود" },
					assistant: { en: "Ziad Antoun", ar: "زياد أنطون" },
					members: [member("Amin", "أمين"), member("Hassan", "حسن"), member("Elias", "إلياس"), member("Hadi", "هادي")],
				},
			],
		},
	},
	{
		id: "caravelles",
		name: { en: "Caravelles", ar: "المنجدات" },
		ageRange: { en: "Ages 15 – 17", ar: "الأعمار 15 – 17" },
		motto: { en: "Bold hope", ar: "رجاء جريء" },
		description: {
			en: "Caravelles lead international service, parish missions, and creative labs that prepare them for adult life.",
			ar: "خدمة دولية، رسالات رعوية، ومختبرات تكوين تحضّرهن لمرحلة الشباب.",
		},
		meeting: {
			en: "Friday · 7:00 PM · Rooftop studio",
			ar: "الجمعة · 7:00 مساءً · السطح",
		},
		image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
		focus: [
			{ en: "Global service", ar: "خدمة دولية" },
			{ en: "Liturgy support", ar: "خدمة ليتورجية" },
			{ en: "Project management", ar: "إدارة مشاريع" },
		],
		leadership: {
			chiefId: "pioneers-lead",
			assistantIds: ["pioneers-assistant-1", "pioneers-assistant-2"],
			patrols: [
				{
					name: { en: "Hearth Saint Rita", ar: "موقد القديسة ريتا" },
					leader: { en: "Christelle Karam", ar: "كريستيل كرم" },
					assistant: { en: "Yasmina Sfeir", ar: "ياسمينا صفير" },
					members: [member("Layal", "ليال"), member("Sabine", "سابين"), member("Gabrielle", "غابرييل"), member("Maria", "ماريا")],
				},
				{
					name: { en: "Hearth Saint Clare", ar: "موقد القديسة كلارا" },
					leader: { en: "Rana Fakhry", ar: "رنا فخري" },
					assistant: { en: "Lina Daher", ar: "لينا ضاهر" },
					members: [member("Perla", "بيرلا"), member("Nadine", "نادين"), member("Celine", "سيلين"), member("Vicky", "فيكي")],
				},
				{
					name: { en: "Hearth Saint Bernadette", ar: "موقد القديسة برناديت" },
					leader: { en: "Sara Bou Ghosn", ar: "سارا بو غصن" },
					assistant: { en: "Joanna Rahme", ar: "جوانا رحمة" },
					members: [member("Farah", "فرح"), member("Elissa", "إليسا"), member("Aline", "ألين"), member("Pamela", "باميلا")],
				},
			],
		},
	},
];

const getLeaderProfile = (id: string, locale: Locale) => {
	const leader = leadershipDefinition.items.find((item) => item.id === id);
	if (!leader) {
		return {
			name: id,
			avatar: defaultAvatar,
		};
	}

	return {
		name: pickLocalized(leader.name, locale),
		avatar: leader.photo ?? defaultAvatar,
	};
};

const mapLocalizedArray = (list: LocalizedString[], locale: Locale) => list.map((item) => pickLocalized(item, locale));

export const buildSectionsContent = (locale: Locale): SectionsPageContent["sections"] =>
	sectionsDefinition.map((section) => ({
		id: section.id,
		name: pickLocalized(section.name, locale),
		ageRange: pickLocalized(section.ageRange, locale),
		motto: pickLocalized(section.motto, locale),
		description: pickLocalized(section.description, locale),
		meeting: pickLocalized(section.meeting, locale),
		image: section.image,
		focus: mapLocalizedArray(section.focus, locale),
		leadership: {
			chief: getLeaderProfile(section.leadership.chiefId, locale),
			assistants: section.leadership.assistantIds.map((assistantId) => getLeaderProfile(assistantId, locale)),
			patrols: section.leadership.patrols.map((patrol) => ({
				name: pickLocalized(patrol.name, locale),
				leader: pickLocalized(patrol.leader, locale),
				assistant: pickLocalized(patrol.assistant, locale),
				members: mapLocalizedArray(patrol.members, locale),
			})),
		},
	}));
