"use client";

import React, { useRef, useState, useMemo } from "react";
import { Upload, FileText, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ResearchPaper } from "@/types/research";

interface UploadFormProps {
  onClose: () => void;
  onUploadSuccess: (paper: ResearchPaper) => void;
  categories: string[];
}

export function UploadForm({
  onClose,
  onUploadSuccess,
  categories,
}: UploadFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success"
  >("idle");
  const [progress, setProgress] = useState(0);

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

  // Validation logic
  const isSubmitDisabled = useMemo(() => {
    return (
      !file ||
      !form.title ||
      !form.abstract ||
      !form.category ||
      (form.type === "paid" && (!form.price || parseFloat(form.price) <= 0)) ||
      uploadStatus === "uploading"
    );
  }, [file, form, uploadStatus]);

  const simulateUpload = () => {
    setUploadStatus("uploading");
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setUploadStatus("success");
          onUploadSuccess({
            id: `rp-${Date.now()}`,
            title: form.title,
            authors: form.authors
              .split(",")
              .map((a) => a.trim())
              .filter(Boolean),
            abstract: form.abstract,
            category: form.category,
            tags: form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            type: form.type as "free" | "paid",
            price: form.type === "paid" ? parseFloat(form.price) : undefined,
            publishedAt: new Date().toISOString(),
            pages: Math.floor(Math.random() * 20) + 5,
            views: 0,
            likes: 0,
            comments: 0,
            pdfUrl: URL.createObjectURL(file!),
            institution: form.institution,
          });
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  if (uploadStatus === "success") {
    return <SuccessView onClose={onClose} />;
  }

  return (
    <div className="space-y-6">
      {/* File Dropzone */}
      <div
        onClick={() => fileRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          file
            ? "border-emerald-400 bg-emerald-50/50"
            : "border-border hover:bg-muted/50",
        )}
      >
        <input
          type="file"
          ref={fileRef}
          className="hidden"
          accept="application/pdf"
          onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium text-emerald-700">
              <FileText className="h-5 w-5" /> {file.name}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm">Click to upload or drag & drop PDF</p>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        <Input
          placeholder="Paper Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          placeholder="Authors (comma separated)"
          value={form.authors}
          onChange={(e) => setForm({ ...form, authors: e.target.value })}
        />
        <Textarea
          placeholder="Abstract"
          rows={4}
          value={form.abstract}
          onChange={(e) => setForm({ ...form, abstract: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            value={form.category}
            onValueChange={(v) => setForm({ ...form, category: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
      </div>

      {uploadStatus === "uploading" && (
        <Progress value={progress} className="h-2" />
      )}

      <Button
        className="w-full bg-orange-500 hover:bg-orange-600"
        onClick={simulateUpload}
        disabled={isSubmitDisabled}
      >
        {uploadStatus === "uploading" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
          </>
        ) : (
          "Submit Paper"
        )}
      </Button>
    </div>
  );
}

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <div>
        <h2 className="text-lg font-bold">Paper Uploaded Successfully!</h2>
        <p className="text-sm text-muted-foreground">
          Your research is now available in the library.
        </p>
      </div>
      <Button onClick={onClose} className="w-full">
        Done
      </Button>
    </div>
  );
}
