"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import galleryItems from "@/data/gallery.json";
import { Image as ImageIcon, Folder, Tag, X, Maximize2, ArrowLeft, ArrowRight, Grid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default function GalleryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;

  const dict = getDictionary(locale);
  const isAr = locale === "ar";

  // Tab State: "albums" or "all"
  const [activeTab, setActiveTab] = useState<"albums" | "all">("albums");
  
  // Selected Album details view (if null, show grid of albums)
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  // Filters
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  // Lightbox
  const [activeImage, setActiveImage] = useState<typeof galleryItems[0] | null>(null);

  // Extract unique tags, albums, and sections
  const getUniqueTags = () => {
    const tags = new Set<string>();
    galleryItems.forEach((item) => {
      item.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  const getUniqueAlbums = () => {
    const albums = new Set<string>();
    galleryItems.forEach((item) => {
      if (item.albumEn && item.albumAr) {
        albums.add(isAr ? item.albumAr : item.albumEn);
      }
    });
    return Array.from(albums);
  };

  const uniqueTags = getUniqueTags();
  const uniqueAlbums = getUniqueAlbums();

  // Helper to resolve album translation back to object details
  const getAlbumCover = (albumName: string) => {
    const matchedPhoto = galleryItems.find(
      (item) => item.albumEn === albumName || item.albumAr === albumName
    );
    return matchedPhoto ? matchedPhoto.src : "";
  };

  const getAlbumPhotoCount = (albumName: string) => {
    return galleryItems.filter(
      (item) => item.albumEn === albumName || item.albumAr === albumName
    ).length;
  };

  // Filter photos based on selection
  const filteredPhotos = galleryItems.filter((item) => {
    const albumName = isAr ? item.albumAr : item.albumEn;
    const matchesAlbum = !selectedAlbum || albumName === selectedAlbum;
    const matchesTag = selectedTag === "all" || item.tags.includes(selectedTag);
    const matchesSection = selectedSection === "all" || item.section === selectedSection;

    return matchesAlbum && matchesTag && matchesSection;
  });

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main className="flex-grow pt-28 pb-20 bg-scout-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="text-xs sm:text-sm text-scout-charcoal/50 mb-6 font-semibold flex items-center gap-2">
            <Link href={`/${locale}`} className="hover:text-scout-gold transition-colors">
              {dict.nav.home}
            </Link>
            <span>/</span>
            {selectedAlbum ? (
              <>
                <button 
                  onClick={() => setSelectedAlbum(null)} 
                  className="hover:text-scout-gold transition-colors cursor-pointer"
                >
                  {dict.nav.gallery}
                </button>
                <span>/</span>
                <span className="text-scout-charcoal">{selectedAlbum}</span>
              </>
            ) : (
              <span className="text-scout-charcoal">{dict.nav.gallery}</span>
            )}
          </nav>

          {/* Page Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-scout-navy font-display">
              {dict.galleryPage.title}
            </h1>
            <p className="text-scout-charcoal/70 mt-4 text-base sm:text-lg leading-relaxed">
              {dict.galleryPage.subtitle}
            </p>
            <div className="w-20 h-1 bg-scout-gold mx-auto mt-6 rounded-full" />
          </div>

          {/* Toggle Tab Bar */}
          {!selectedAlbum && (
            <div className="flex justify-center mb-10">
              <div className="bg-white/70 border border-scout-beige-dark/50 p-1 rounded-2xl flex gap-1 shadow-sm">
                <button
                  onClick={() => {
                    setActiveTab("albums");
                    setSelectedTag("all");
                    setSelectedSection("all");
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                    activeTab === "albums"
                      ? "bg-scout-navy text-white shadow-sm"
                      : "text-scout-charcoal/80 hover:bg-scout-beige/50"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>{dict.galleryPage.tabAlbums}</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedTag("all");
                    setSelectedSection("all");
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-scout-navy text-white shadow-sm"
                      : "text-scout-charcoal/80 hover:bg-scout-beige/50"
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>{dict.galleryPage.tabAll}</span>
                </button>
              </div>
            </div>
          )}

          {/* ALBUMS VIEW */}
          {activeTab === "albums" && !selectedAlbum && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {uniqueAlbums.map((albumName) => {
                const coverSrc = getAlbumCover(albumName);
                const count = getAlbumPhotoCount(albumName);

                return (
                  <div
                    key={albumName}
                    onClick={() => setSelectedAlbum(albumName)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-scout-beige-dark/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="relative aspect-[4/3] bg-scout-beige overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverSrc}
                        alt={albumName}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-scout-navy/35 group-hover:bg-scout-navy/20 transition-colors" />
                      <div className="absolute bottom-4 left-4 bg-scout-navy/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{dict.galleryPage.photoCount.replace("{count}", count.toString())}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-extrabold text-scout-navy font-display mb-2 group-hover:text-scout-gold transition-colors duration-300">
                        {albumName}
                      </h3>
                      <span className="text-xs font-bold text-scout-gold uppercase tracking-wider flex items-center gap-1">
                        <span>{dict.galleryPage.viewAlbum}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SINGLE ALBUM VIEW OR ALL PHOTOS VIEW */}
          {((activeTab === "all") || selectedAlbum) && (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Sidebar Filters */}
              <div className="lg:col-span-3 space-y-6">
                
                {selectedAlbum && (
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    className="w-full flex items-center justify-center gap-2 border border-scout-navy/20 hover:border-scout-gold text-scout-navy font-bold py-3.5 px-4 rounded-2xl bg-white hover:bg-scout-beige/10 transition-all text-xs tracking-wider uppercase shadow-sm cursor-pointer"
                  >
                    {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    <span>{dict.galleryPage.backGallery}</span>
                  </button>
                )}

                {/* Filter by Tag */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-scout-navy border-b border-scout-beige-dark/30 pb-2.5 mb-3 flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-scout-gold" />
                    <span>{dict.galleryPage.filterTags}</span>
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedTag("all")}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-semibold ${
                        selectedTag === "all"
                          ? "bg-scout-gold border-scout-gold text-scout-navy"
                          : "bg-scout-beige/60 border-scout-beige-dark/30 text-scout-charcoal hover:bg-scout-beige"
                      }`}
                    >
                      {isAr ? "الكل" : "All"}
                    </button>
                    {uniqueTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer font-semibold ${
                          selectedTag === tag
                            ? "bg-scout-gold border-scout-gold text-scout-navy"
                            : "bg-scout-beige/60 border-scout-beige-dark/30 text-scout-charcoal hover:bg-scout-beige"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter by Section */}
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-scout-navy border-b border-scout-beige-dark/30 pb-2.5 mb-3 flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-scout-gold" />
                    <span>{dict.galleryPage.filterSections}</span>
                  </h3>
                  
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setSelectedSection("all")}
                      className={`text-xs text-left px-3 py-2 rounded-xl border transition-all cursor-pointer font-semibold ${
                        selectedSection === "all"
                          ? "bg-scout-gold border-scout-gold text-scout-navy"
                          : "bg-scout-beige/60 border-scout-beige-dark/30 text-scout-charcoal hover:bg-scout-beige"
                      }`}
                    >
                      {isAr ? "جميع الأقسام" : "All Sections"}
                    </button>
                    {[
                      { key: "louveteaux", label: dict.sections.louveteaux.title },
                      { key: "jeannettes", label: dict.sections.jeannettes.title },
                      { key: "eclaireurs", label: (dict.sections as any).eclaireurs?.title || (isAr ? "الكشافة" : "Boy Scouts") },
                      { key: "guides", label: (dict.sections as any).guides?.title || (isAr ? "المرشدات" : "Guides") },
                      { key: "routiers", label: (dict.sections as any).routiers?.title || (isAr ? "الجوالة" : "Routiers") },
                      { key: "caravelles", label: (dict.sections as any).caravelles?.title || (isAr ? "المنجدات" : "Caravelles") },
                    ].map((sec) => (
                      <button
                        key={sec.key}
                        onClick={() => setSelectedSection(sec.key)}
                        className={`text-xs text-left px-3 py-2 rounded-xl border transition-all cursor-pointer font-semibold ${
                          selectedSection === sec.key
                            ? "bg-scout-gold border-scout-gold text-scout-navy"
                            : "bg-scout-beige/60 border-scout-beige-dark/30 text-scout-charcoal hover:bg-scout-beige"
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Photo Grid Column */}
              <div className="lg:col-span-9 bg-white p-6 rounded-3xl shadow-sm border border-scout-beige-dark/50">
                {selectedAlbum && (
                  <h2 className="text-xl sm:text-2xl font-extrabold text-scout-navy font-display mb-6 pb-2.5 border-b border-scout-beige-dark/30">
                    {selectedAlbum}
                  </h2>
                )}
                
                {filteredPhotos.length === 0 ? (
                  <div className="py-12 text-center text-scout-charcoal/50 italic">
                    {dict.galleryPage.emptyAlbum}
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
                    {filteredPhotos.map((item) => {
                      const caption = isAr ? item.captionAr : item.captionEn;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveImage(item)}
                          className="relative rounded-2xl overflow-hidden bg-scout-beige cursor-pointer group shadow-sm border border-scout-beige-dark/30 break-inside-avoid mb-4 inline-block w-full"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.src}
                            alt={caption}
                            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-103"
                          />
                          <div className="absolute inset-0 bg-scout-navy/55 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                            <div className="flex justify-end">
                              <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                <Maximize2 className="w-4 h-4 text-scout-gold-light" />
                              </div>
                            </div>
                            <p className="text-xs font-semibold leading-snug">
                              {caption}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-md"
            onClick={() => setActiveImage(null)}
          >
            <button
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50 cursor-pointer"
              onClick={() => setActiveImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.src}
                alt={isAr ? activeImage.captionAr : activeImage.captionEn}
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-2xl border border-white/5"
              />
              <div className="mt-4 text-center max-w-xl px-4 text-white flex flex-col items-center">
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-scout-gold bg-scout-gold/10 px-3 py-1 rounded-full mb-2">
                  {isAr ? activeImage.albumAr : activeImage.albumEn}
                </span>
                <p className="text-sm leading-relaxed mb-3">
                  {isAr ? activeImage.captionAr : activeImage.captionEn}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                  {activeImage.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-bold bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>

                {activeImage.activityId && (
                  <Link
                    href={`/${locale}/activities/${activeImage.activityId}`}
                    className="inline-flex items-center gap-2 bg-scout-gold hover:bg-scout-gold-light text-scout-navy-dark font-extrabold py-2.5 px-5 rounded-xl text-xs tracking-wider uppercase shadow hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => setActiveImage(null)}
                  >
                    <span>{isAr ? "تفاصيل النشاط" : "View Activity Details"}</span>
                    {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
