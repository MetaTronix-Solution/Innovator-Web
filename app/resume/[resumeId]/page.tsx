"use client";

import { use, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { ResumeData, ResumeTemplate } from "@/types/resume";
import TemplateSelector from "@/components/resume/TemplateSelector";
import ResumeForm from "@/components/resume/ResumeForm";
import ResumePreview from "@/components/resume/ResumePreview";
import {
  Layers,
  FileText,
  Download,
  ChevronLeft,
  Eye,
  Pencil,
  Save,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

function buildDefaultData(
  name: string,
  email: string,
  avatarUrl: string,
  phone: string,
): ResumeData {
  return {
    personalInfo: {
      name,
      title: "",
      email,
      phone,
      location: "",
      website: "",
      bio: "",
      avatarUrl,
    },
    experience: [],
    education: [],
    skills: [],
    links: [],
  };
}

const STORAGE_KEY = (id: string) => `innovator_resume_${id}`;

type Tab = "template" | "edit";
type MobileView = "edit" | "preview";

export default function ResumePage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = use(params);

  const user = useSelector((state: RootState) => state.auth.user);

  const displayName = user?.full_name || user?.username || "";
  const email = user?.email || "";
  const avatarUrl = user?.profile_image || user?.profile?.avatar || "";
  const phone = user?.profile?.phone_number || "";

  const [template, setTemplate] = useState<ResumeTemplate>("classic");
  const [data, setData] = useState<ResumeData>(() =>
    buildDefaultData(displayName, email, avatarUrl, phone),
  );
  const [activeTab, setActiveTab] = useState<Tab>("template");
  const [mobileView, setMobileView] = useState<MobileView>("edit");
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY(resumeId));
      if (stored) {
        const parsed = JSON.parse(stored) as {
          template: ResumeTemplate;
          data: ResumeData;
        };
        setTemplate(parsed.template);
        setData(parsed.data);
        return;
      }
    } catch {}
    setData(buildDefaultData(displayName, email, avatarUrl, phone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY(resumeId),
        JSON.stringify({ template, data }),
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      window.print();
      setDownloading(false);
    }, 100);
  };

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#resume-print-root) { display: none !important; }
          #resume-print-root {
            display: block !important;
            position: fixed;
            inset: 0;
            z-index: 9999;
          }
        }
      `}</style>

      <div id="resume-print-root" className="hidden">
        <ResumePreview template={template} data={data} />
      </div>

      {/* Outer shell — full viewport, muted bg */}
      <div className="flex flex-col h-screen bg-muted/50 overflow-hidden">
        {/* Max-width centering wrapper with uniform padding */}
        <div className="flex flex-col flex-1 min-h-0 max-w-7xl w-full mx-auto p-3 gap-3">
          {/* ── Header ── */}
          <header className="shrink-0 bg-card border border-border rounded-xl flex items-center px-4 h-14 gap-3">
            <Link
              href={`/${user?.id}`}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Create your resume</span>
            </div>

            <div className="flex-1" />

            {/* Mobile toggle */}
            <button
              onClick={() =>
                setMobileView((v) => (v === "edit" ? "preview" : "edit"))
              }
              className="lg:hidden flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              {mobileView === "edit" ? (
                <>
                  <Eye className="w-4 h-4" /> Preview
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" /> Edit
                </>
              )}
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border font-medium transition-all",
                saved
                  ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30"
                  : "border-border hover:bg-muted text-foreground",
              )}
            >
              {saved ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </>
              )}
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </header>

          {/* ── Body row ── */}
          <div className="flex flex-1 min-h-0 gap-3">
            {/* Left panel — editor */}
            <aside
              className={cn(
                "w-full lg:w-[380px] shrink-0 flex flex-col bg-card border border-border rounded-xl overflow-hidden",
                mobileView === "preview" ? "hidden lg:flex" : "flex",
              )}
            >
              <div className="flex border-b border-border shrink-0">
                {(
                  [
                    { id: "template", icon: Layers, label: "Templates" },
                    { id: "edit", icon: Pencil, label: "Content" },
                  ] as const
                ).map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
                      activeTab === id
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-border">
                {activeTab === "template" ? (
                  <div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Pick a layout — your content carries across.
                    </p>
                    <TemplateSelector
                      selected={template}
                      onChange={setTemplate}
                    />
                  </div>
                ) : (
                  <ResumeForm data={data} onChange={setData} />
                )}
              </div>
            </aside>

            {/* Right panel — live preview */}
            <main
              className={cn(
                "flex-1 bg-muted/40 border border-border rounded-xl overflow-auto no-scrollbar",
                mobileView === "edit" ? "hidden lg:block" : "block",
              )}
            >
              <div className="min-h-full flex items-start justify-center p-6 lg:p-8">
                <div
                  ref={previewRef}
                  className="w-full max-w-[794px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-black/5"
                  style={{ minHeight: "1123px" }}
                >
                  <ResumePreview template={template} data={data} />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
