import { leadershipAr } from "@/lib/content/shared/leadership/ar";
import type { SectionsPageContent } from "@/lib/translations";
import { buildSectionsContent } from "../shared/sections/data";

const leaderProfiles = leadershipAr.items.reduce<Record<string, { name: string; avatar: string }>>((acc, leader) => {
	acc[leader.id] = { name: leader.name, avatar: leader.photo };
	return acc;
}, {});

const pickLeader = (id: string) => {
	const profile = leaderProfiles[id];
	return {
		name: profile?.name ?? id,
		avatar: profile?.avatar ?? "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
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
	sections: buildSectionsContent("ar"),
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
