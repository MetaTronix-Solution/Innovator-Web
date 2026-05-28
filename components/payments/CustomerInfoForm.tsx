"use client";

import { Field } from "@/app/(main)/checkout/page";

export interface CustomerInfo {
  fullName: string;
  phone: string;
  area: string;
  deliveryAddress: string;
  notes?: string;
}

export function CustomerInfoForm({
  form,
  onChange,
  onContinue,
}: {
  form: CustomerInfo;
  onChange: (field: keyof CustomerInfo, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="FULL NAME *"
        value={form.fullName}
        placeholder="Enter your name"
        onChange={(v: string) => onChange("fullName", v)}
      />
      <Field
        label="PHONE NUMBER*"
        value={form.phone}
        placeholder="Enter your mobile number"
        onChange={(v: string) => onChange("phone", v)}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* <Field
          label="AREA / NEIGHBORHOOD *"
          value={form.area}
          placeholder="e.g., Baluwatar"
          onChange={(v: string) => onChange("area", v)}
        /> */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            CITY
          </label>
          <input
            disabled
            value="Kathmandu Valley"
            className="w-full bg-muted border rounded-xl px-4 py-3 text-sm border-border cursor-not-allowed"
          />
        </div>
      </div>

      <Field
        label="DETAILED DELIVERY ADDRESS *"
        placeholder="House number, street name, or nearby landmark"
        value={form.deliveryAddress}
        onChange={(v: string) => onChange("deliveryAddress", v)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          NOTES (OPTIONAL)
        </label>
        <textarea
          rows={3}
          value={form.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="e.g., Gate color, drop-off instructions..."
          className="w-full bg-background border rounded-xl px-4 py-3 text-sm border-border focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all"
      >
        Continue
      </button>
    </div>
  );
}
