"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResearchPaper } from "@/types/research";
import {
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Lock,
  BookOpen,
  Tag,
  Download,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PaymentModal, ReceiptModal } from "@/components/PaymentModal";

export default function ResearchDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [paper, setPaper] = useState<ResearchPaper | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [likedPaperIds, setLikedPaperIds] = useState<string[]>([]);
  const [unlockedPaperIds, setUnlockedPaperIds] = useState<string[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedPapers = localStorage.getItem("innovator_research_papers");
      let allPapers: ResearchPaper[] = [];
      if (cachedPapers) {
        try {
          allPapers = JSON.parse(cachedPapers);
          setPapers(allPapers);
        } catch {}
      }

      const foundPaper = allPapers.find((p) => p.id === id);
      if (foundPaper) {
        setPaper(foundPaper);
      }

      const cachedLikes = localStorage.getItem("innovator_liked_papers");
      if (cachedLikes) {
        try {
          setLikedPaperIds(JSON.parse(cachedLikes));
        } catch {}
      }

      const cachedUnlocks = localStorage.getItem("innovator_unlocked_papers");
      if (cachedUnlocks) {
        try {
          setUnlockedPaperIds(JSON.parse(cachedUnlocks));
        } catch {}
      }

      setLoading(false);
    }
  }, [id]);

  const handleLikeToggle = () => {
    if (!paper) return;
    const isAlreadyLiked = likedPaperIds.includes(paper.id);
    let updatedLikedIds: string[];

    if (isAlreadyLiked) {
      updatedLikedIds = likedPaperIds.filter((likedId) => likedId !== paper.id);
      toast.success("Removed paper from bookmarks.");
    } else {
      updatedLikedIds = [...likedPaperIds, paper.id];
      toast.success("Paper bookmarked successfully!");
    }

    setLikedPaperIds(updatedLikedIds);
    localStorage.setItem(
      "innovator_liked_papers",
      JSON.stringify(updatedLikedIds),
    );

    const updatedPaper = {
      ...paper,
      likes: isAlreadyLiked ? Math.max(0, paper.likes - 1) : paper.likes + 1,
    };
    setPaper(updatedPaper);

    const updatedPapers = papers.map((p) =>
      p.id === paper.id ? updatedPaper : p,
    );
    setPapers(updatedPapers);
    localStorage.setItem(
      "innovator_research_papers",
      JSON.stringify(updatedPapers),
    );
  };

  const handleUnlockPaper = () => {
    setIsPaymentOpen(false);
    const toastId = toast.loading("Redirecting to Khalti Gateway...");

    setTimeout(() => {
      toast.dismiss(toastId);
      toast.info("Authenticating via Khalti...");

      setTimeout(() => {
        const updatedUnlocks = [...unlockedPaperIds, paper!.id];
        setUnlockedPaperIds(updatedUnlocks);
        localStorage.setItem(
          "innovator_unlocked_papers",
          JSON.stringify(updatedUnlocks),
        );
        setIsReceiptOpen(true);
      }, 1500);
    }, 1000);
  };

  const handleDownloadPaper = () => {
    if (!paper) return;
    const toastId = toast.loading(
      `Generating PDF: ${paper.title.slice(0, 30)}...`,
    );

    setTimeout(() => {
      toast.dismiss(toastId);
      toast.success(`PDF downloaded successfully!`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-3">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-semibold text-foreground">Paper not found</p>
        <p className="text-sm text-muted-foreground">
          The research paper you are looking for does not exist.
        </p>
        <Button
          onClick={() => router.push("/research")}
          className="bg-orange-500 text-white mt-2"
        >
          Back to Research Hub
        </Button>
      </div>
    );
  }

  const isLiked = likedPaperIds.includes(paper.id);
  const isUnlocked = unlockedPaperIds.includes(paper.id);
  const isLocked = paper.type === "paid" && !isUnlocked;

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-20 px-2 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/research")}
          className="gap-2 rounded-xl border border-border shadow-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLikeToggle}
          className={cn(
            "rounded-xl border border-border text-muted-foreground transition-colors",
            isLiked
              ? "border-orange-500 bg-orange-50 text-orange-500 dark:bg-orange-950/20"
              : "",
          )}
        >
          <Heart
            size={18}
            className={cn(isLiked ? "fill-orange-500 text-orange-500" : "")}
          />
        </Button>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="text-xs bg-muted text-muted-foreground"
          >
            {paper.category}
          </Badge>
          {isLocked ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Lock className="h-3.5 w-3.5" /> NPR {paper.price}
            </span>
          ) : paper.type === "paid" ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Unlocked
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <BookOpen className="h-3.5 w-3.5" /> Free Access
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            {paper.title}
          </h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">
              {paper.authors.join(", ")}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4 border border-border">
          {paper.institution && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Institution
              </p>
              <p className="text-sm font-semibold text-foreground truncate">
                {paper.institution}
              </p>
            </div>
          )}
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Published Date
            </p>
            <p className="text-sm text-foreground">
              {new Date(paper.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Page Count
            </p>
            <p className="text-sm text-foreground">{paper.pages} pages</p>
          </div>
        </div>

        {/* Metrics details */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground border-y border-border py-3">
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {paper.views.toLocaleString()} views
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="h-4 w-4 text-orange-500 fill-orange-500/10" />
            {paper.likes} likes
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            {paper.comments} comments
          </span>
        </div>

        {/* Abstract */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Abstract
          </h4>
          <p className="text-sm leading-relaxed text-foreground text-justify whitespace-pre-line bg-card border border-border p-4 rounded-xl shadow-sm font-light">
            {paper.abstract}
          </p>
        </div>

        {/* Keywords tags */}
        <div className="space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Keywords
          </h4>
          <div className="flex flex-wrap gap-2">
            {paper.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-lg border border-border bg-muted px-2.5 py-1 text-xs text-foreground transition hover:bg-muted/85"
              >
                <Tag className="h-3 w-3 text-muted-foreground" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-2">
          {isLocked ? (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-6 text-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/35 mx-auto">
                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Premium Document Locked
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Purchase full lifetime access for NPR {paper.price} to view
                  the dynamic document viewer, download the PDF, and extract
                  reference metrics.
                </p>
              </div>
              <Button
                onClick={() => setIsPaymentOpen(true)}
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-5"
              >
                Enroll Now · NPR {paper.price}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    if (paper.pdfUrl) {
                      window.open(paper.pdfUrl, "_blank");
                    } else {
                      toast.error("PDF document not found.");
                    }
                  }}
                  className="flex-1 font-semibold py-5"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Read Full PDF
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownloadPaper}
                  className="h-10 w-10 border border-border"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {paper && (
            <>
              <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                paper={paper}
                onConfirm={handleUnlockPaper}
              />

              <ReceiptModal
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                paper={paper}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
