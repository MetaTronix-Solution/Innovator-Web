"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";

interface ReportModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({
  userId,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setDescription("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason) {
      setError("Please select a reason before reporting");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${userId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, description }),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      alert("Report submitted successfully.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-[100]">
      <div className="bg-white text-black rounded-lg p-8 w-full max-w-lg shadow-xl relative z-[110]">
        <h2 className="text-2xl font-bold mb-6">Report User</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-semibold mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value) setError("");
              }}
              className={`w-full border p-3 rounded-md focus:ring-2 focus:ring-red-500 ${
                error ? "border-red-500 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="fake">Fake account</option>
              <option value="copyright">Copyright violation</option>
              <option value="other">Other</option>
            </select>

            {error && (
              <p className="text-red-600 text-sm mt-2 font-medium">{error}</p>
            )}
          </div>

          <div>
            <label className="block text-base font-semibold mb-1.5">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md h-32 focus:ring-2 focus:ring-red-500"
              placeholder="Tell us more about the report..."
            />
          </div>

          <div className="flex justify-between gap-3 mt-6">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              className="flex-1 p-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 p-6"
            >
              {isSubmitting ? "Sending..." : "Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
