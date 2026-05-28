"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { researchPapers, categories, ResearchPaper } from "@/types/research";
import {
  Search,
  Upload,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Lock,
  BookOpen,
  X,
  Calendar,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  BookMarked,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadStatus = "idle" | "uploading" | "success" | "error";

function UploadForm({
  onClose,
  onUploadSuccess,
}: {
  onClose: () => void;
  onUploadSuccess: (paper: ResearchPaper) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [form, setForm] = useState({
    title: "",
    authors: "",
    abstract: "",
    category: "",
    tags: "",
    type: "free",
    price: "",
    institution: "",
  });

  const handleFile = (f: File) => {
    if (f.type === "application/pdf") {
      setFile(f);
    } else {
      toast.error("Invalid file format. Only PDF files are allowed.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const simulateUpload = () => {
    if (!file || !form.title || !form.abstract || !form.category) return;

    if (form.type === "paid") {
      const priceVal = parseFloat(form.price);
      if (isNaN(priceVal) || priceVal <= 0) {
        toast.error("Please enter a valid price greater than 0 NPR.");
        return;
      }
    }

    setUploadStatus("uploading");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploadStatus("success");

          const newPaper: ResearchPaper = {
            id: `rp-${Date.now()}`,
            title: form.title,
            authors: form.authors
              ? form.authors
                  .split(",")
                  .map((a) => a.trim())
                  .filter(Boolean)
              : ["Anonymous User"],
            abstract: form.abstract,
            category: form.category,
            tags: form.tags
              ? form.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
            type: form.type as "free" | "paid",
            price: form.type === "paid" ? parseFloat(form.price) : undefined,
            publishedAt: new Date().toISOString().split("T")[0],
            pages: Math.floor(Math.random() * 15) + 6,
            views: 0,
            likes: 0,
            comments: 0,
            pdfUrl: file
              ? URL.createObjectURL(file)
              : "/papers/dummy-paper.pdf",
            institution: form.institution || undefined,
          };

          onUploadSuccess(newPaper);
          return 100;
        }
        return p + Math.random() * 18;
      });
    }, 200);
  };

  if (uploadStatus === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">
            Paper submitted successfully!
          </p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Your research paper has been approved and added to your library feed
            instantly.
          </p>
        </div>
        <Button
          onClick={onClose}
          className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* File Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200",
          dragOver
            ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
            : file
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
              : "border-border hover:border-orange-300 hover:bg-muted/40",
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <FileText className="h-6 w-6 text-emerald-600 animate-bounce" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X className="mr-1 h-3 w-3" /> Remove
            </Button>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                Drop your PDF here or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF format only · Max 25 MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Upload progress */}
      {uploadStatus === "uploading" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />{" "}
              Uploading…
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="title">Paper Title *</Label>
          <Input
            id="title"
            placeholder="Enter the full title of your paper"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="authors">Authors (comma separated) *</Label>
          <Input
            id="authors"
            placeholder="e.g. John Doe, Jane Smith"
            value={form.authors}
            onChange={(e) => setForm({ ...form, authors: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            placeholder="e.g. Tribhuvan University"
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="abstract">Abstract *</Label>
          <Textarea
            id="abstract"
            placeholder="Provide a concise summary of your research (150–300 words)"
            rows={4}
            value={form.abstract}
            onChange={(e) => setForm({ ...form, abstract: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.slice(1).map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Access Type *</Label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm({ ...form, type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.type === "paid" && (
          <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
            <Label htmlFor="price">Price (NPR) *</Label>
            <Input
              id="price"
              type="number"
              min="1"
              placeholder="e.g. 299"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        )}

        <div
          className={cn(
            "space-y-1.5",
            form.type === "paid" ? "" : "sm:col-span-2",
          )}
        >
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="e.g. IoT, ESP32, Arduino"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
      </div>

      {uploadStatus === "error" && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Something went wrong. Please try again.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={
            !file ||
            !form.title ||
            !form.abstract ||
            !form.category ||
            (form.type === "paid" &&
              (!form.price || parseFloat(form.price) <= 0)) ||
            uploadStatus === "uploading"
          }
          onClick={simulateUpload}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {uploadStatus === "uploading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading…
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Submit Paper
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function PaperCard({
  paper,
  onClick,
  isUnlocked,
  isLiked,
}: {
  paper: ResearchPaper;
  onClick: () => void;
  isUnlocked: boolean;
  isLiked: boolean;
}) {
  const isLocked = paper.type === "paid" && !isUnlocked;

  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 hover:border-orange-200 dark:hover:border-orange-800"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge
          variant="secondary"
          className="text-xs font-medium bg-muted text-muted-foreground"
        >
          {paper.category}
        </Badge>
        {isLocked ? (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <Lock className="h-3 w-3" /> NPR {paper.price}
          </span>
        ) : paper.type === "paid" ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Unlocked
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <BookOpen className="h-3 w-3" /> Free
          </span>
        )}
      </div>

      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        {paper.title}
      </h3>

      <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5 shrink-0" />
        {paper.authors.join(", ")}
      </p>

      <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground leading-relaxed">
        {paper.abstract}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {paper.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            #{tag}
          </span>
        ))}
        {paper.tags.length > 3 && (
          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            +{paper.tags.length - 3}
          </span>
        )}
      </div>

      <Separator className="mb-3" />

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {paper.views.toLocaleString()}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 transition-colors",
              isLiked ? "text-orange-500" : "",
            )}
          >
            <Heart
              className={cn("h-3.5 w-3.5", isLiked ? "fill-orange-500" : "")}
            />
            {paper.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {paper.comments}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(paper.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
    </article>
  );
}

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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
