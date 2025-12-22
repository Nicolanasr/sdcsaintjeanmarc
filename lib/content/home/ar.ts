import { buildActivitiesList } from "@/lib/content/shared/activities/data";
import { buildSectionsContent } from "@/lib/content/shared/sections/data";
import type { HomeContent } from "@/lib/translations";

const sectionPalette = [
	"from-emerald-500 to-emerald-700",
	"from-lime-400 to-emerald-500",
	"from-teal-500 to-emerald-600",
	"from-emerald-600 to-green-800",
];

const homeSectionsAr = buildSectionsContent("ar").map((section, index) => ({
	id: section.id,
	name: section.name,
	ageRange: section.ageRange,
	description: section.description,
	color: sectionPalette[index % sectionPalette.length],
}));

export const homeAr: HomeContent = {
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
		items: homeSectionsAr,
	},
	activities: {
		title: "أنشطتنا القادمة",
		subtitle: "أبرز فعالياتنا خلال الفصل الأول.",
		cta: "اطلعوا على التقويم الكامل →",
		items: buildActivitiesList("ar"),
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
		description: "انضموا إلى عائلتنا الكشفية الدافئة، وتعرّفوا على قادة ملهمين، واكتشفوا تجارب تصنع أثراً في حياة أولادكم. نحن بانتظاركم!",
		primaryCta: "اطلبوا ملف المعلومات",
		secondaryCta: "تحدثوا مع قائد",
	},
};
