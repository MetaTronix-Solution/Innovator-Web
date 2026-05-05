"use client";

import React from "react";
import { UserPlus } from "lucide-react";

import UserSuggestion from "../UserSuggestion";

const RightWidgets = () => {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-full sticky  h-fit">
      {/* 2. Suggested Innovators Section */}
      <section className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            <h3 className="font-bold text-sm tracking-tight uppercase">
              Suggested for you
            </h3>
          </div>
        </div>

        <div className="max-h-fit overflow-hidden">
          <UserSuggestion />
        </div>
      </section>
    </aside>
  );
};

export default RightWidgets;
