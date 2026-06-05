"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { researchPapers, categories, ResearchPaper } from "@/types/research";
import {
  Search,
  Upload,
  FileText,
  Lock,
  BookOpen,
  Filter,
  Plus,
  BookMarked,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { PaperCard } from "@/components/Research/PaperCard";
import { UploadForm } from "@/components/Research/UploadForm";

export default function ResearchPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"all" | "free" | "paid">("all");
  const [uploadOpen, setUploadOpen] = useState(false);

  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [likedPaperIds, setLikedPaperIds] = useState<string[]>([]);
  const [unlockedPaperIds, setUnlockedPaperIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cachedPapers = localStorage.getItem("innovator_research_papers");
      if (cachedPapers) {
        try {
          setPapers(JSON.parse(cachedPapers));
        } catch {
          setPapers(researchPapers);
        }
      } else {
        setPapers(researchPapers);
        localStorage.setItem(
          "innovator_research_papers",
          JSON.stringify(researchPapers),
        );
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
    }
  }, []);

  const savePapersToStorage = (updatedPapers: ResearchPaper[]) => {
    setPapers(updatedPapers);
    localStorage.setItem(
      "innovator_research_papers",
      JSON.stringify(updatedPapers),
    );
  };

  const handleUploadSuccess = (newPaper: ResearchPaper) => {
    const updated = [newPaper, ...papers];
    savePapersToStorage(updated);
  };

  const filtered = papers.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      p.abstract.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesType = typeFilter === "all" || p.type === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const freeCount = papers.filter((p) => p.type === "free").length;
  const paidCount = papers.filter((p) => p.type === "paid").length;

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                <BookMarked className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Research Hub
              </span>
            </div>
            <Button onClick={() => setUploadOpen(true)} className="" size="lg">
              <Plus className="h-4 w-4" />
              Submit Paper
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: "Total Papers",
              value: papers.length,
              icon: FileText,
              color: "text-orange-500",
              bg: "bg-orange-50 dark:bg-orange-950/20",
            },
            {
              label: "Free Access",
              value: freeCount,
              icon: BookOpen,
              color: "text-emerald-600",
              bg: "bg-emerald-50 dark:bg-emerald-950/20",
            },
            {
              label: "Premium",
              value: paidCount,
              icon: Lock,
              color: "text-amber-600",
              bg: "bg-amber-50 dark:bg-amber-950/20",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-3 rounded-xl p-4 border border-border transition-all duration-200 hover:shadow-sm",
                bg,
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/60 dark:bg-black/20",
                  color,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground leading-none">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search papers, authors, abstracts, or keywords…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as "all" | "free" | "paid")}
            >
              <SelectTrigger className="w-32 gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="free">Free only</SelectItem>
                <SelectItem value="paid">Paid only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-150",
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">
              No papers found
            </p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 auto-rows-fr">
            {filtered.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                onClick={() => router.push(`/research/${paper.id}`)}
                isUnlocked={unlockedPaperIds.includes(paper.id)}
                isLiked={likedPaperIds.includes(paper.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-foreground">
              <Upload className="h-5 w-5 text-orange-500" />
              Submit a Research Paper
            </DialogTitle>
            <DialogDescription>
              Your paper will be reviewed by the Innovator team before being
              published publicly.
            </DialogDescription>
          </DialogHeader>

          <UploadForm
            onClose={() => setUploadOpen(false)}
            onUploadSuccess={handleUploadSuccess}
            categories={["IoT", "Machine Learning", "Data Science", "Physics"]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
