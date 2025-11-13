"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiChevronDown, FiFilter, FiImage, FiMapPin, FiSliders, FiTag } from "react-icons/fi";

import { FilterChip, TagChip } from "@/components/filter-chip";
import { useLanguage } from "@/components/language-provider";
import { PageHero } from "@/components/page-hero";
import { useAlbumFilters } from "@/hooks/use-album-filters";
import { usePageContent } from "@/hooks/use-page-content";
import type { GalleryAlbum } from "@/lib/translations";

export default function GalleryPage() {
    const { language } = useLanguage();
    const content = usePageContent("galleryPage");
	const {
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
		hasFilters,
		activeFilterCount,
		toggleSection,
		toggleTag,
	} = useAlbumFilters(content.albums, content.filters.sortOptions[0].value);

    return (
        <div className="space-y-16 pb-20">
            <PageHero
                badge={content.hero.badge}
                title={content.hero.title}
                description={content.hero.description}
                image={content.hero.image}
                stats={content.hero.stats}
                imagePriority
            />

            <section className="mx-auto w-full max-w-6xl space-y-3">
				<button
					type="button"
					onClick={() => setShowFilters((prev) => !prev)}
					className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white/90 px-6 py-4 text-left text-sm font-semibold text-slate-700 shadow-sm"
				>
					<span className="inline-flex items-center gap-2">
						<FiFilter className="h-5 w-5 text-emerald-600" />
						{language === "ar" ? "الفلاتر" : "Filters"}
						{hasFilters ? (
							<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{activeFilterCount}</span>
						) : null}
					</span>
					<FiChevronDown className={`h-4 w-4 transition ${showFilters ? "rotate-180" : ""}`} />
				</button>
				<div className={`grid overflow-hidden transition-all ${showFilters ? "grid-rows-[1fr]" : "grid-rows-[0fr]"} rounded-3xl border border-slate-200 bg-white/95 shadow-sm`}>
					<div className="space-y-6 px-6 py-6">
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
								<FiSliders className="h-4 w-4 text-emerald-600" />
								{content.filters.sectionLabel}
							</p>
                            <div className="flex flex-wrap gap-2">
                                {sectionOptions.map((section) => (
                                    <FilterChip
                                        key={section}
                                        label={section}
                                        active={sectionFilters.includes(section)}
                                        onClick={() => toggleSection(section)}
                                    />
                                ))}
                            </div>
						</div>
						<div className="space-y-2">
							<p className="text-xs uppercase tracking-[0.35em] text-slate-500 flex items-center gap-2">
								<FiTag className="h-4 w-4 text-emerald-600" />
								{content.filters.tagLabel}
							</p>
                            <div className="flex flex-wrap gap-2">
                                {tagOptions.map((tag) => (
                                    <TagChip
                                        key={tag}
                                        label={tag}
                                        active={tagFilters.includes(tag)}
                                        onClick={() => toggleTag(tag)}
                                    />
                                ))}
                            </div>
						</div>
						<div className="flex flex-wrap items-center justify-between gap-3">
							<button
								type="button"
								onClick={() => {
									setSectionFilters([]);
									setTagFilters([]);
									setSortOption(content.filters.sortOptions[0].value);
								}}
								className={`text-xs font-semibold ${hasFilters ? "text-emerald-700 hover:underline" : "text-slate-400"}`}
								disabled={!hasFilters}
							>
								{language === "ar" ? "مسح الفلاتر" : "Clear all"}
							</button>
							<div className="flex items-center gap-2">
								<label className="text-xs uppercase tracking-[0.35em] text-slate-500">
									{content.filters.sortLabel}
								</label>
								<div className="relative">
									<select
										value={sortOption}
										onChange={(event) => setSortOption(event.target.value)}
										className="appearance-none rounded-full border border-slate-200 bg-white px-5 py-2 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:border-emerald-300 focus:outline-none"
									>
										{content.filters.sortOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
									<FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
								</div>
							</div>
						</div>
					</div>
				</div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <p className="text-sm text-slate-600">
                        {language === "ar"
                            ? `عدد الألبومات: ${filteredAlbums.length}`
                            : `${filteredAlbums.length} albums currently visible`}
                    </p>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-500">
                        <FiImage className="h-4 w-4" />
                        {language === "ar" ? "اضغطوا للدخول إلى ألبوم" : "Tap an album to dive in"}
                    </div>
                </div>
                {filteredAlbums.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-12 text-center">
                        <p className="text-xl font-semibold text-slate-900">{content.emptyState.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{content.emptyState.description}</p>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {filteredAlbums.map((album) => (
                            <AlbumCard key={album.id} album={album} language={language} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}


function AlbumCard({ album, language }: { album: GalleryAlbum; language: string }) {
    return (
        <Link
            href={`/gallery/${album.id}`}
            className="group relative flex flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1"
        >
            <div className="relative h-64 w-full overflow-hidden">
                <Image
                    src={album.coverImage}
                    alt={album.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-4 left-4 space-y-2 text-white">
                    <span className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]">
                        {album.section}
                    </span>
                    <p className="text-sm text-white/80">{album.location} · {album.dateRange}</p>
                </div>
            </div>
            <div className="flex flex-col gap-4 p-6">
                <div>
                    <h3 className="text-2xl font-semibold text-slate-900">{album.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{album.description}</p>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                        <FiMapPin className="h-4 w-4" />
                        {album.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <FiImage className="h-4 w-4" />
                        {language === "ar" ? `${album.images.length} صورة` : `${album.images.length} photos`}
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {album.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                            #{tag}
                        </span>
                    ))}
                    {album.tags.length > 4 ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                            +{album.tags.length - 4}
                        </span>
                    ) : null}
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex gap-6 text-sm text-slate-600">
                        {album.stats.map((stat) => (
                            <div key={stat.label}>
                                <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        {language === "ar" ? "استعرضوا الألبوم" : "View album"}
                        <FiArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
