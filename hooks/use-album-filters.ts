import { useMemo, useState } from "react";

import type { GalleryAlbum } from "@/lib/translations";

export function useAlbumFilters(albums: GalleryAlbum[], defaultSort: string) {
	const [sectionFilters, setSectionFilters] = useState<string[]>([]);
	const [tagFilters, setTagFilters] = useState<string[]>([]);
	const [sortOption, setSortOption] = useState(defaultSort);
	const [showFilters, setShowFilters] = useState(false);

	const sectionOptions = useMemo(() => Array.from(new Set(albums.map((album) => album.section))), [albums]);
	const tagOptions = useMemo(() => Array.from(new Set(albums.flatMap((album) => album.tags))), [albums]);

	const filteredAlbums = useMemo(() => {
		let list = [...albums];

		if (sectionFilters.length > 0) {
			list = list.filter((album) => sectionFilters.includes(album.section));
		}
		if (tagFilters.length > 0) {
			list = list.filter((album) => tagFilters.every((tag) => album.tags.includes(tag)));
		}

		switch (sortOption) {
			case "oldest":
				list.sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
				break;
			case "section":
				list.sort((a, b) => a.section.localeCompare(b.section));
				break;
			case "location":
				list.sort((a, b) => a.location.localeCompare(b.location));
				break;
			case "newest":
			default:
				list.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
				break;
		}

		return list;
	}, [albums, sectionFilters, tagFilters, sortOption]);

	const toggleValue = (value: string, selected: string[], setter: (next: string[]) => void) => {
		setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
	};

	return {
		sectionFilters,
		tagFilters,
		sortOption,
		showFilters,
		setShowFilters,
		setSectionFilters,
		setTagFilters,
		setSortOption,
		sectionOptions,
		tagOptions,
		filteredAlbums,
		hasFilters: sectionFilters.length > 0 || tagFilters.length > 0,
		activeFilterCount: sectionFilters.length + tagFilters.length,
		toggleSection: (section: string) => toggleValue(section, sectionFilters, setSectionFilters),
		toggleTag: (tag: string) => toggleValue(tag, tagFilters, setTagFilters),
	};
}

