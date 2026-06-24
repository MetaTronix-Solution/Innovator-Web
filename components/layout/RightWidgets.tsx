"use client";
import React from "react";
import UserSuggestion from "../UserSuggestion";

const RightWidgets = () => {
  return (
    <aside className="hidden lg:flex flex-col gap-6 w-full sticky top-6 h-fit">
      <UserSuggestion />
    </aside>
  );
};

export default RightWidgets;
