type SelectableChipProps = {
	label: string;
	active: boolean;
	onClick: () => void;
};

export function FilterChip({ label, active, onClick }: SelectableChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
				active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-emerald-200"
			}`}
		>
			{label}
		</button>
	);
}

export function TagChip({ label, active, onClick }: SelectableChipProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
				active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
			}`}
		>
			#{label}
		</button>
	);
}

