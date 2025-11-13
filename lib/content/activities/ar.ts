import type { ActivitiesPageContent } from "@/lib/translations";

export const activitiesPageAr: ActivitiesPageContent = {
	hero: {
		badge: "تقويم النشاطات",
		title: "مغامراتنا القادمة",
		description:
			"يبقى فوج سان جان مارك نشطاً طوال العام عبر مخيمات، طلعات، وخدمة مجتمعية لكل الفئات. إليكم لمحة عمّا ينتظر عائلاتكم.",
		image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
		highlights: ["برنامج تدريجي", "مرافقة شخصية", "حياة طليعة نابضة"],
		primaryCta: { label: "اكتشفوا التقويم", href: "#calendar" },
		secondaryCta: { label: "نشاطات مميزة", href: "#featured" },
	},
	intro:
		"نمزج بين المغامرة، الخدمة، والتكوين الروحي. يعيش الكشافة لحظات تنمّي شخصيتهم وتبقى محفورة في الذاكرة.",
	featured: {
		title: "نشاطات مميزة",
		subtitle: "خطة مختارة للأحداث التي لا تُفوّت في الشهر القادم.",
	},
	calendar: {
		title: "تقويم شهر واحد",
		subtitle: "نحدّث هذا التقويم أسبوعياً لمتابعة النشاطات والأهالي المشاركين.",
		badgePrefix: "شهر ",
		badgeSuffix: "",
		ctaLabel: "اسأل عن نشاط",
		ctaHref: "/contact",
	},
	spotlights: [
		{
			badge: "مختبرات مهارية",
			title: "نتعلم في قلب الطبيعة",
			description:
				"فرق صغيرة يقودها قادتنا تتدرّب على إشعال النار، قراءة الخرائط، والسلامة الليلية من خلال سيناريوهات تشجع الجرأة.",
			image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
			statValue: "6",
			statLabel: "مخيّمات ليلية سنوياً",
		},
		{
			badge: "خدمة ورسالة",
			title: "نخدم مجتمعنا",
			description:
				"من حملات التنظيف إلى زيارة المسنين، يعيش الكشافون الخدمة شهرياً ويكتشفون معنى القيادة المتواضعة.",
			image: "https://images.unsplash.com/photo-1460400355176-3680d9ab85fa?auto=format&fit=crop&w=1200&q=80",
			statValue: "12",
			statLabel: "مبادرة تطوعية",
		},
		{
			badge: "لحظات إيمان",
			title: "سهرات حول النار",
			description:
				"تتخلل كل طلعة لحظات صلاة وتأمل تُشعل في القلوب روح الامتنان وتعزز الروابط بين الكشافين.",
			image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
			statValue: "1",
			statLabel: "وقفة روحية أسبوعية",
		},
	],
	spotlightsIntro: {
		title: "لماذا يعشق الكشافون برنامجنا",
		subtitle: "لقطات مصورة من مغامراتنا، خدمتنا، ولحظات الإيمان التي تصنع ذكريات مدى الحياة.",
	},
	galleryPreview: {
		title: "لمحات مصورة",
		subtitle: "صور سريعة من مخيماتنا وورشاتنا الأخيرة.",
		ctaLabel: "شاهد المعرض",
		images: [
			{
				src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
				alt: "أمسية حول النار",
				title: "أمسية حول النار",
			},
			{
				src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
				alt: "مسار كشفي",
				title: "مسار كشفي",
			},
			{
				src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
				alt: "تحدي النهر",
				title: "تحدي النهر",
			},
			{
				src: "https://images.unsplash.com/photo-1521335629791-ce4aec67dd47?auto=format&fit=crop&w=1200&q=80",
				alt: "يوم خدمة",
				title: "يوم خدمة",
			},
		],
	},
};
