import type { LocalizedString } from "@/lib/content/shared/localized";

type LeaderDefinition = {
	id: string;
	name: LocalizedString;
	role: LocalizedString;
	bio: LocalizedString;
	photo: string;
};

type LeadershipDefinition = {
	title: LocalizedString;
	items: LeaderDefinition[];
	orgChart: {
		rows: {
			label: LocalizedString;
			highlight?: boolean;
			compact?: boolean;
			nodes: { leader: string; assistants: string[] }[];
		}[];
	};
};

export const leadershipDefinition: LeadershipDefinition = {
	title: {
		en: "Meet our leadership team",
		ar: "تعرّفوا على فريق القيادة",
	},
	items: [
		{
			id: "chef-group",
			name: { en: "Ghinwa Ounaissy", ar: "Ghinwa Ounaissy" },
			role: { en: "Chef de groupe", ar: "قائدة الفوج" },
			bio: {
				en: "Guides the entire troop, mentors leaders, and ensures every program stays true to our mission.",
				ar: "تقود العمل التربوي وترافق القادة لضمان انسجام البرامج مع رسالتنا.",
			},
			photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "assistant-chef",
			name: { en: "Nicolas Nasr", ar: "Nicolas Nasr" },
			role: {
				en: "Assistant chef de groupe",
				ar: "مساعد قائد الفوج",
			},
			bio: {
				en: "Supports logistics and high-adventure programming, bringing engineering precision to every camp.",
				ar: "يهتم بالمخيمات واللوجستيات ويضمن جودة المغامرات الهادفة.",
			},
			photo: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "secretary",
			name: { en: "Petina Abi Hanna", ar: "لينا سعادة" },
			role: {
				en: "Secretary (Amin Serr)",
				ar: "أمين سر",
			},
			bio: {
				en: "Keeps parent communication flowing and archives the troop’s memories and milestones.",
				ar: "تعتني بالتواصل مع الأهل وتوثيق نشاطات الفوج.",
			},
			photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "treasurer",
			name: { en: "Francois Abi Char", ar: "كريم بعلبكي" },
			role: { en: "Treasurer (Amin Sandouq)", ar: "أمين صندوق" },
			bio: {
				en: "Oversees budgets and fundraising so every scout can participate fully.",
				ar: "يدير الميزانيات والحملات الداعمة لضمان مشاركة الجميع.",
			},
			photo: "https://images.unsplash.com/photo-1502767089025-6572583495b4?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "quartermaster",
			name: { en: "Rayen Merhi", ar: "إيلي مطر" },
			role: { en: "Quartermaster (Amin Tajhizet)", ar: "أمين تجهيزات" },
			bio: {
				en: "Maintains gear, transportation, and safety kits for every outing.",
				ar: "يشرف على العتاد والسلامة والنقل لكل الطلعات.",
			},
			photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "operations-lead",
			name: { en: "Pinella Abi Hanna", ar: "نور شديد" },
			role: { en: "Administrative lead", ar: "قائد إداري" },
			bio: {
				en: "Coordinates calendars, permissions, and training so volunteers stay aligned.",
				ar: "ينسّق الجداول، الاستمارات، ودورات التكوين للقادة.",
			},
			photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "operations-lead-2",
			name: { en: "Charly Nasr", ar: "شارلي نصر" },
			role: { en: "Administrative lead", ar: "قائد إداري" },
			bio: {
				en: "Coordinates calendars, permissions, and training so volunteers stay aligned.",
				ar: "يتابع الشؤون الإدارية اليومية ويضمن توافر الموارد لكل فرع.",
			},
			photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "operations-lead-3",
			name: { en: "Ibtisam Barakat", ar: "ابتسام بركات" },
			role: { en: "Administrative lead", ar: "قائدة إدارية" },
			bio: {
				en: "Coordinates calendars, permissions, and training so volunteers stay aligned.",
				ar: "تنظم السجلات، الأرشيف، ودعم الأسر المحتاجة خلال السنة.",
			},
			photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "louveteaux-lead",
			name: { en: "Francois Abi Char", ar: "أنطوني رزق" },
			role: { en: "Louveteaux unit leader", ar: "قائد فرقة الجرميز" },
			bio: {
				en: "Builds teamwork through patrol games and first overnight experiences.",
				ar: "يرافق الجرميز في ألعاب الطليعة وأول مخيم ليلي.",
			},
			photo: "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "louveteaux-assistant",
			name: { en: "Yara Saab", ar: "يارا صعب" },
			role: { en: "Louveteaux assistant", ar: "مساعدة فرقة الجرميز" },
			bio: {
				en: "Coaches songs, skits, and service badges for the pack.",
				ar: "تهتم بالأناشيد والشارات وترافق الطلائع في أنشطتها.",
			},
			photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "flowers-lead",
			name: { en: "Michelle", ar: "مايا طنوس" },
			role: { en: "Zahrat unit leader", ar: "قائدة الزهرات" },
			bio: {
				en: "Helps Zaharat discover service through art, dance, and nature walks.",
				ar: "تساعد الزهرات على اكتشاف الخدمة عبر الفن والطبيعة.",
			},
			photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "flowers-assistant",
			name: { en: "Reine", ar: "جولي نصر" },
			role: { en: "Zahrat assistant", ar: "مساعدة الزهرات" },
			bio: {
				en: "Organizes ceremonies and badge tracking for the floral patrols.",
				ar: "تنظم الاحتفالات ومتابعة الشارات الخاصة بالطلائع.",
			},
			photo: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "guides-lead",
			name: { en: "Lea Daher", ar: "ليا ضاهر" },
			role: { en: "Guides unit leader", ar: "قائدة فرقة المرشدات" },
			bio: {
				en: "Accompanies our Mourchidat through identity-forming outdoor journeys.",
				ar: "ترافق المرشدات في رحلات هوية ومسارات روحية بالطبيعة.",
			},
			photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "guides-assistant",
			name: { en: "Clara Abboud", ar: "كلارا عبود" },
			role: { en: "Guides assistant", ar: "مساعدة المرشدات" },
			bio: {
				en: "Leads prayer circles and reflection moments around the campfire.",
				ar: "تقود حلقات الصلاة والتأمل حول نار المخيم.",
			},
			photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "scouts-lead",
			name: { en: "Nour Sahyoun", ar: "ليا ضاهر" },
			role: { en: "scouts unit leader", ar: "قائدة فرقة المرشدات" },
			bio: {
				en: "Accompanies our Mourchidat through identity-forming outdoor journeys.",
				ar: "ترافق المرشدات في رحلات هوية ومسارات روحية بالطبيعة.",
			},
			photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "scouts-assistant",
			name: { en: "William Noun", ar: "كلارا عبود" },
			role: { en: "scouts unit leader", ar: "مساعدة المرشدات" },
			bio: {
				en: "Leads prayer circles and reflection moments around the campfire.",
				ar: "تقود حلقات الصلاة والتأمل حول نار المخيم.",
			},
			photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "rovers-lead",
			name: { en: "Omar Khoury", ar: "عمر خوري" },
			role: { en: "Jawala unit leader", ar: "قائد الجوالة" },
			bio: {
				en: "Mentors Jouwele in leadership rotations and trek planning.",
				ar: "يرافق الجوالة في أدوار القيادة والتخطيط للرحلات.",
			},
			photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "rovers-assistant",
			name: { en: "Sami Abou Khalil", ar: "سامي أبو خليل" },
			role: { en: "Jawala assistant", ar: "مساعد الجوالة" },
			bio: {
				en: "Handles equipment checks and emergency drills for the rovers.",
				ar: "يتابع فحوصات التجهيزات وتمارين السلامة للطوارئ.",
			},
			photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "pioneers-lead",
			name: { en: "Christelle Nassar", ar: "كريستيل نصار" },
			role: { en: "Mounjidet unit leader", ar: "قائدة المنجدات" },
			bio: {
				en: "Accompanies senior scouts through discernment, service expeditions, and faith formation.",
				ar: "ترافق المنجدات في التمييز، الخدمة، والتكوين الروحي.",
			},
			photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "pioneers-assistant-1",
			name: { en: "Hiba Gerges", ar: "هيبا جرجس" },
			role: { en: "Mounjidet assistant", ar: "مساعدة المنجدات" },
			bio: {
				en: "Coordinates formation weekends and service partnerships for the unit.",
				ar: "تنظم أسابيع التكوين والشراكات الخدمية للوحدة.",
			},
			photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
		},
		{
			id: "pioneers-assistant-2",
			name: { en: "Ranya Fadel", ar: "رانيا فاضل" },
			role: { en: "Mounjidet assistant", ar: "مساعدة المنجدات" },
			bio: {
				en: "Supports leadership coaching and accompanies international exchanges.",
				ar: "تدعم التدريب القيادي وترافق برامج التبادل الخارجي.",
			},
			photo: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
		},
	],
	orgChart: {
		rows: [
			{
				label: {
					en: "Group leadership",
					ar: "قيادة الفوج",
				},
				highlight: true,
				nodes: [{ leader: "chef-group", assistants: ["assistant-chef"] }],
			},
			{
				label: {
					en: "Administrative core",
					ar: "الفريق الإداري",
				},
				nodes: [
					{ leader: "secretary", assistants: [] },
					{ leader: "treasurer", assistants: [] },
					{ leader: "quartermaster", assistants: [] },
					{ leader: "operations-lead", assistants: [] },
					{ leader: "operations-lead-2", assistants: [] },
					{ leader: "operations-lead-3", assistants: [] },
				],
			},
			{
				label: {
					en: "Section leadership",
					ar: "قيادة الفروع",
				},
				nodes: [
					{ leader: "louveteaux-lead", assistants: ["louveteaux-assistant"] },
					{ leader: "flowers-lead", assistants: ["flowers-assistant"] },
					{ leader: "guides-lead", assistants: ["guides-assistant"] },
					{ leader: "scouts-lead", assistants: ["scouts-assistant"] },
					{ leader: "rovers-lead", assistants: ["rovers-assistant"] },
					{ leader: "pioneers-lead", assistants: ["pioneers-assistant-1", "pioneers-assistant-2"] },
				],
			},
		],
	},
};
