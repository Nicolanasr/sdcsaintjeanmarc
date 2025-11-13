"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FiArrowLeft, FiTag } from "react-icons/fi";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

import { CTAButton } from "@/components/cta-button";
import { TagChip } from "@/components/filter-chip";
import { useLanguage } from "@/components/language-provider";
import { usePageContent } from "@/hooks/use-page-content";
import type { GalleryAlbum } from "@/lib/translations";

export default function GalleryAlbumPage() {
	const params = useParams<{ album: string }>();
	const { language } = useLanguage();
	const content = usePageContent("galleryPage");
	const album = useMemo(
		() => content.albums.find((item) => item.id === params.album),
		[content.albums, params.album],
	);

	if (!album) {
		return (
			<div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center space-y-6 text-center">
				<p className="text-2xl font-semibold text-slate-900">
					{language === "ar" ? "لم نعثر على هذا الألبوم" : "Album not found"}
				</p>
				<CTAButton href="/gallery" variant="outline">
					{language === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</CTAButton>
			</div>
		);
	}

	return <AlbumView album={album} />;
}

function AlbumView({ album }: { album: GalleryAlbum }) {
	const { language } = useLanguage();

	const [activeTags, setActiveTags] = useState<string[]>([]);
	const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

	const tagOptions = useMemo(() => Array.from(new Set(album.images.flatMap((img) => img.tags))), [album.images]);
	const filteredImages = useMemo(() => {
		if (activeTags.length === 0) {
			return album.images;
		}
		return album.images.filter((image) => activeTags.every((tag) => image.tags.includes(tag)));
	}, [album.images, activeTags]);

	const slides = useMemo(
		() =>
			album.images.map((image) => ({
				src: image.image,
				description: image.tags.map((tag) => `#${tag}`).join(" "),
				title: image.title,
			})),
		[album.images],
	);

	const toggleTag = (tag: string) => {
		setActiveTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
	};

	return (
		<div className="space-y-12 pb-20">
			<section className="-mx-6 md:-mx-12 overflow-hidden rounded-b-[40px] border border-slate-900/10 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white shadow-xl">
				<div className="relative h-[320px] w-full">
					<Image src={album.coverImage} alt={album.title} fill className="object-cover" priority />
					<div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
					<div className="absolute inset-x-6 bottom-6 flex flex-col gap-3 md:inset-x-12">
						<Link href="/gallery" className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
							<FiArrowLeft className="h-4 w-4" />
							{language === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
						</Link>
						<div>
							<h1 className="text-4xl font-bold">{album.title}</h1>
							<p className="mt-2 max-w-2xl text-sm text-white/90">{album.description}</p>
						</div>
						<div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/70">
							<span>{album.section}</span>
							<span>{album.location}</span>
							<span>{album.dateRange}</span>
							<span>{language === "ar" ? `${album.images.length} صورة` : `${album.images.length} photos`}</span>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto w-full max-w-6xl space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
						<FiTag className="h-5 w-5 text-emerald-600" />
						{language === "ar" ? "وسوم الألبوم" : "Album tags"}
					</h2>
					<button
						type="button"
						onClick={() => setActiveTags([])}
						className={`text-sm font-semibold ${
							activeTags.length > 0 ? "text-emerald-700 hover:underline" : "text-slate-400"
						}`}
						disabled={activeTags.length === 0}
					>
						{language === "ar" ? "مسح الوسوم" : "Clear tags"}
					</button>
				</div>
				<div className="flex flex-wrap gap-2">
					{tagOptions.map((tag) => (
						<TagChip key={tag} label={tag} active={activeTags.includes(tag)} onClick={() => toggleTag(tag)} />
					))}
				</div>
			</section>

			<section className="mx-auto w-full max-w-6xl space-y-6">
				<div className="grid gap-6 md:grid-cols-2">
					{filteredImages.map((image) => {
						const slideIndex = album.images.findIndex((item) => item.id === image.id);
						return (
							<button
								type="button"
								key={image.id}
								onClick={() => setLightboxIndex(slideIndex)}
								className="group relative h-72 w-full overflow-hidden rounded-[32px] border border-white/30 bg-gradient-to-br from-slate-900/5 to-transparent"
							>
								<Image src={image.image} alt={image.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
								<div className="absolute inset-0 bg-slate-900/30 opacity-0 transition group-hover:opacity-100" />
								<div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
									{image.tags.map((tag) => (
										<span key={tag} className="rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-slate-800">
											#{tag}
										</span>
									))}
								</div>
							</button>
						);
					})}
				</div>
			</section>

			<Lightbox
				open={lightboxIndex >= 0}
				index={lightboxIndex >= 0 ? lightboxIndex : 0}
				close={() => setLightboxIndex(-1)}
				slides={slides}
				controller={{ closeOnBackdropClick: true }}
				plugins={[Captions]}
				captions={{ descriptionTextAlign: language === "ar" ? "end" : "start" }}
			/>
		</div>
	);
}
