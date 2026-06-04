import { useState, useRef, useCallback, useEffect, memo } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import LazyVideo from "./LazyVideo";

const MediaCarousel = memo(
  ({ media, thumbnail }: { media: any[]; thumbnail?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isExpanded && scrollRef.current) {
        const container = scrollRef.current;
        container.scrollLeft = currentIndex * container.offsetWidth;
      }
    }, [isExpanded]);

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        if (!isExpanded) return;
        const { scrollLeft, offsetWidth } = e.currentTarget;
        const newIndex = Math.round(scrollLeft / offsetWidth);
        if (newIndex !== currentIndex) setCurrentIndex(newIndex);
      },
      [isExpanded, currentIndex],
    );

    const scrollTo = useCallback((dir: "prev" | "next") => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const offset =
        dir === "next" ? container.offsetWidth : -container.offsetWidth;
      container.scrollTo({
        left: container.scrollLeft + offset,
        behavior: "smooth",
      });
    }, []);

    const openModal = (index: number) => {
      setCurrentIndex(index);
      setIsExpanded(true);
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    };

    const closeModal = () => {
      setIsExpanded(false);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };

    if (media.length === 1) {
      const fileUrl = getMediaUrl(media[0].file);
      return (
        <div
          className="w-full bg-muted/20 border-y border-border/40 cursor-pointer"
          onClick={() => openModal(0)} // ✅ uncomment this
        >
          <div className="relative w-full h-[400px]">
            <Image
              src={fileUrl || ""}
              alt="Post"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {isExpanded && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 animate-in fade-in duration-200">
              <div
                className="absolute inset-0"
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
                className="absolute top-6 left-6 z-[1000] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <div className="relative w-full max-w-5xl h-[85vh] px-4">
                <Image
                  src={fileUrl || ""}
                  alt="Full View"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full bg-muted/20 border-y border-border/40 p-1">
        <div className="grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
          {media.slice(0, 4).map((item, idx) => {
            const isFullWidthRow = media.length === 3 && idx === 0;
            return (
              <div
                key={item.id || idx}
                onClick={() => openModal(idx)}
                className={`relative cursor-pointer bg-black/5 overflow-hidden group 
                  ${isFullWidthRow ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
              >
                <Image
                  src={getMediaUrl(item.file) || ""}
                  alt="preview"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
                {idx === 3 && media.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <span className="text-xl font-bold">
                      +{media.length - 4}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      See More
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isExpanded && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={closeModal} />

            <button
              onClick={closeModal}
              className="absolute top-6 left-6 z-[1000] p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>

            <div className="absolute top-7 right-7 z-[1000] text-white/80 font-mono text-sm">
              {currentIndex + 1} / {media.length}
            </div>

            <div className="relative w-full max-w-6xl h-[85vh] flex items-center justify-center pointer-events-none">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pointer-events-auto"
                style={{ scrollbarWidth: "none" }}
              >
                {media.map((item, idx) => {
                  const fileUrl = getMediaUrl(item.file) || "";
                  const isVideo =
                    item.media_type === "video" ||
                    fileUrl.toLowerCase().match(/\.(mp4|webm|mov|m4v)$/);

                  return (
                    <div
                      key={idx}
                      className="w-full h-full shrink-0 snap-center flex items-center justify-center px-4"
                    >
                      {isVideo ? (
                        <LazyVideo
                          src={fileUrl}
                          className="max-h-full max-w-full rounded-lg"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={fileUrl}
                            alt="Full View"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollTo("prev");
                }}
                className={`absolute left-0 pointer-events-auto bg-white/10 p-3 rounded-full text-white transition-opacity ${currentIndex === 0 ? "opacity-0" : "opacity-100"}`}
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollTo("next");
                }}
                className={`absolute right-0 pointer-events-auto bg-white/10 p-3 rounded-full text-white transition-opacity ${currentIndex === media.length - 1 ? "opacity-0" : "opacity-100"}`}
              >
                <ChevronRight size={32} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);
MediaCarousel.displayName = "MediaCarousel";

export default MediaCarousel;
