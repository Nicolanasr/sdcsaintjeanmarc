import type { Locale, LocalizedString } from "@/lib/content/shared/localized";
import { pickLocalized } from "@/lib/content/shared/localized";
import type { ActivityContent } from "@/lib/translations";

type ActivityDefinition = {
	slug: string;
	title: LocalizedString;
	date: LocalizedString;
	description: LocalizedString;
	location: LocalizedString;
	datetime: string;
	endTime: string;
	image: string;
	section: LocalizedString;
	highlights: LocalizedString[];
	gear: LocalizedString[];
	contact: LocalizedString;
};

const text = (en: string, ar: string): LocalizedString => ({ en, ar });

const activityDefinitions: ActivityDefinition[] = [
	{
		slug: "autumn-skills-camp",
		title: text("Autumn Skills Camp", "مخيم مهارات الخريف"),
		date: text("October 4 – 6, 2025", "4 – 6 تشرين الأول 2025"),
		description: text(
			"Weekend camp focusing on outdoor cooking, pioneering, and teamwork challenges.",
			"نهاية أسبوع نركّز فيها على الطهي في الهواء الطلق والفنون الكشفية وتحديات العمل الجماعي."
		),
		location: text("Camp Lac Vert", "مخيم لاك فير"),
		datetime: "2025-10-04T17:00:00+03:00",
		endTime: "2025-10-06T12:00:00+03:00",
		image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80",
		section: text("Scouts & Pionniers", "الكشافة والرواد"),
		highlights: [
			text("Patrol camp setup and wilderness cooking labs", "إعداد المخيم ومختبرات الطهي في الطبيعة"),
			text("Night navigation challenge through cedar trails", "تحدي الملاحة الليلية بين الأرز"),
			text("Sunday closing liturgy and parent debrief", "قداس واختتام مع الأهل نهار الأحد"),
		],
		gear: [
			text("Complete weekend pack", "حقيبة تخييم كاملة"),
			text("Sleeping bag (3-season)", "كيس نوم ثلاثي المواسم"),
			text("Hiking boots & rain shell", "حذاء مشي وجاكيت مقاوم للمطر"),
		],
		contact: text("Leader Joseph · +961 711 554 892", "القائد جوزيف · ‎+961 711 554 892"),
	},

	{
		slug: "family-welcome-campfire-2",
		title: text("Family Welcome Campfire 2", "أمسية نار المخيم الترحيبية"),
		date: text("January 14, 2026", "January 14, 2026"),
		description: text(
			"An evening of songs, games, and meeting the leaders to kick off the scouting year.",
			"أغانٍ وألعاب ولقاء مع القادة لافتتاح السنة الكشفية الجديدة."
		),
		location: text("Parc Saint Jean", "حديقة سان جان"),
		datetime: "2026-01-14T18:00:00+03:00",
		endTime: "2026-01-14T21:00:00+03:00",
		image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
		section: text("All Sections", "كل الفروع"),
		highlights: [
			text("Campfire songs and skits to welcome new families", "أغاني ونشاطات حول النار لاستقبال العائلات الجديدة"),
			text("Parent orientation with Q&A circles led by our scouters", "جلسة تعارف وأسئلة وأجوبة مع القادة"),
			text("Icebreaker challenges for every age group", "ألعاب تعارف لكل الفئات العمرية"),
		],
		gear: [
			text("Reusable water bottle", "عبوة ماء قابلة لإعادة التعبئة"),
			text("Camp chair or picnic blanket", "كرسي تخييم أو بطانية"),
			text("Scout neckerchief", "منديل الكشافة"),
		],
		contact: text("Leader Marie · +961 372 4473", "القائدة ماري · ‎+961 372 4473"),
	},
	{
		slug: "family-welcome-campfire",
		title: text("Family Welcome Campfire", "أمسية نار المخيم الترحيبية"),
		date: text("September 14, 2025", "14 أيلول 2025"),
		description: text(
			"An evening of songs, games, and meeting the leaders to kick off the scouting year.",
			"أغانٍ وألعاب ولقاء مع القادة لافتتاح السنة الكشفية الجديدة."
		),
		location: text("Parc Saint Jean", "حديقة سان جان"),
		datetime: "2025-09-14T18:00:00+03:00",
		endTime: "2025-09-14T21:00:00+03:00",
		image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
		section: text("All Sections", "كل الفروع"),
		highlights: [
			text("Campfire songs and skits to welcome new families", "أغاني ونشاطات حول النار لاستقبال العائلات الجديدة"),
			text("Parent orientation with Q&A circles led by our scouters", "جلسة تعارف وأسئلة وأجوبة مع القادة"),
			text("Icebreaker challenges for every age group", "ألعاب تعارف لكل الفئات العمرية"),
		],
		gear: [
			text("Reusable water bottle", "عبوة ماء قابلة لإعادة التعبئة"),
			text("Camp chair or picnic blanket", "كرسي تخييم أو بطانية"),
			text("Scout neckerchief", "منديل الكشافة"),
		],
		contact: text("Leader Marie · +961 372 4473", "القائدة ماري · ‎+961 372 4473"),
	},
	{
		slug: "community-service-day",
		title: text("Community Service Day", "يوم الخدمة المجتمعية"),
		date: text("November 9, 2025", "9 تشرين الثاني 2025"),
		description: text(
			"All sections unite to support our neighborhood through a day of helpful service projects.",
			"تجتمع كل الفروع لدعم حيّنا عبر سلسلة من مشاريع الخدمة."
		),
		location: text("Community Center", "المركز المجتمعي"),
		datetime: "2025-11-09T09:00:00+03:00",
		endTime: "2025-11-09T15:00:00+03:00",
		image: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1600&q=80",
		section: text("All Sections", "كل الفروع"),
		highlights: [
			text("Neighborhood cleanup and tree planting teams", "تنظيف الحي وتشجير الزوايا العامة"),
			text("Castors craft cards for the parish seniors", "القنادس يصنعون بطاقات للمسنين في الرعية"),
			text("Hot lunch prepared by the parent committee", "غداء ساخن من إعداد لجنة الأهل"),
		],
		gear: [
			text("Work gloves", "قفازات عمل"),
			text("Refillable water bottle", "عبوة ماء شخصية"),
			text("Group t-shirt or neckerchief", "قميص أو منديل الفرقة"),
		],
		contact: text("Leader Sarah · +961 702 220 456", "القائدة سارة · ‎+961 702 220 456"),
	},
	{
		slug: "winter-leadership-hike",
		title: text("Winter Leadership Hike", "مسير القيادة الشتوي"),
		date: text("December 7, 2025", "7 كانون الأول 2025"),
		description: text(
			"Senior scouts tackle a ridge hike focused on leadership rotations and winter prep skills.",
			"الكشافة المتقدمون يخوضون مسيراً جبلياً للتركيز على القيادة والتجهيز لموسم الشتاء."
		),
		location: text("Chouf Cedar Reserve", "محمية أرز الشوف"),
		datetime: "2025-12-07T08:00:00+02:00",
		endTime: "2025-12-07T17:00:00+02:00",
		image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
		section: text("Pionniers", "الرواد"),
		highlights: [
			text("Rotating leadership checkpoints with mentor feedback", "محطات قيادة بالتناوب مع تقييم من القادة"),
			text("Workshops on shelter building and stove safety", "ورش بناء مأوى شتوي واستعمال مواقد الغاز"),
			text("Solo reflection moments overlooking cedar valleys", "لحظات تأمل فردية مطلّة على وديان الأرز"),
		],
		gear: [
			text("Layered hiking pack", "حقيبة ظهر مع ملابس طبقات"),
			text("Trekking poles", "عصي مشي"),
			text("Thermos with hot drink", "ترمس مع مشروب ساخن"),
		],
		contact: text("Leader Antoine · +961 356 9911", "القائد أنطوان · ‎+961 356 9911"),
	},
	{
		slug: "christmass-camp-2025",
		title: text("Christmass camp 2025", "مسير القيادة الشتوي"),
		date: text("December 26, 2025", "7 كانون الأول 2025"),
		description: text(
			"Senior scouts tackle a ridge hike focused on leadership rotations and winter prep skills.",
			"الكشافة المتقدمون يخوضون مسيراً جبلياً للتركيز على القيادة والتجهيز لموسم الشتاء."
		),
		location: text("Deir al kettara", "محمية أرز الشوف"),
		datetime: "2025-12-26T08:00:00+02:00",
		endTime: "2025-12-28T17:00:00+02:00",
		image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1600&q=80",
		section: text("All", "الرواد"),
		highlights: [
			text("Rotating leadership checkpoints with mentor feedback", "محطات قيادة بالتناوب مع تقييم من القادة"),
			text("Workshops on shelter building and stove safety", "ورش بناء مأوى شتوي واستعمال مواقد الغاز"),
			text("Solo reflection moments overlooking cedar valleys", "لحظات تأمل فردية مطلّة على وديان الأرز"),
		],
		gear: [
			text("Layered hiking pack", "حقيبة ظهر مع ملابس طبقات"),
			text("Trekking poles", "عصي مشي"),
			text("Thermos with hot drink", "ترمس مع مشروب ساخن"),
		],
		contact: text("Leader Antoine · +961 356 9911", "القائد أنطوان · ‎+961 356 9911"),
	},
];

const mapLocalizedList = (list: LocalizedString[], locale: Locale) => list.map((item) => pickLocalized(item, locale));

export const buildActivitiesList = (locale: Locale): ActivityContent[] =>
	activityDefinitions
		.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
		.map((activity) => ({
			slug: activity.slug,
			title: pickLocalized(activity.title, locale),
			date: pickLocalized(activity.date, locale),
			description: pickLocalized(activity.description, locale),
			location: pickLocalized(activity.location, locale),
			datetime: activity.datetime,
			endTime: activity.endTime,
			image: activity.image,
			section: pickLocalized(activity.section, locale),
			highlights: mapLocalizedList(activity.highlights, locale),
			gear: mapLocalizedList(activity.gear, locale),
			contact: pickLocalized(activity.contact, locale),
		}));
