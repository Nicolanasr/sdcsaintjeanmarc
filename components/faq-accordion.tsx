import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

type FAQItem = {
	question: string;
	answer: string;
};

type FaqAccordionProps = {
	items: FAQItem[];
	initialOpen?: number | null;
	className?: string;
};

export function FaqAccordion({ items, initialOpen = 0, className = "" }: FaqAccordionProps) {
	const [openIndex, setOpenIndex] = useState<number | null>(initialOpen ?? null);

	return (
		<div className={`space-y-4 ${className}`}>
			{items.map((item, index) => {
				const isOpen = openIndex === index;
				return (
					<button
						type="button"
						key={item.question}
						className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-200"
						onClick={() => setOpenIndex(isOpen ? null : index)}
					>
						<div className="flex items-center justify-between gap-4">
							<p className="text-base font-semibold text-slate-900">{item.question}</p>
							<span
								className={`rounded-full border border-slate-200 p-2 text-slate-500 transition ${
									isOpen ? "bg-emerald-50 text-emerald-600" : ""
								}`}
							>
								<FiChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
							</span>
						</div>
						<div
							className={`grid overflow-hidden text-sm text-slate-600 transition-all ${
								isOpen ? "grid-rows-[1fr] pt-4" : "grid-rows-[0fr]"
							}`}
						>
							<p className="overflow-hidden">{item.answer}</p>
						</div>
					</button>
				);
			})}
		</div>
	);
}

