"use client";
import React from "react";
import UserSuggestion from "../UserSuggestion";

const RightWidgets = () => {
  return (
    <aside className="hidden lg:flex flex-col gap-6 w-full sticky top-6 h-fit">
      <div className="relative">
        <div className="glass-float relative rounded-3xl overflow-hidden">
          <UserSuggestion />
        </div>
      </div>
    </aside>
  );
};

export default RightWidgets;
