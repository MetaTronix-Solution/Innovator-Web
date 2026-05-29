import React, { useState } from "react";

// Assuming TRENDING_TAGS is defined elsewhere
const TRENDING_TAGS: string[] = [
  "tech",
  "innovation",
  "react",
  "design",
  "webdev",
  "ai",
];

interface HashtagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function HashtagInput({ tags, onChange }: HashtagInputProps) {
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s/g, "");
    setInputVal(v);

    if (v.length > 0) {
      const query = v.startsWith("#") ? v.slice(1) : v;
      setSuggestions(
        TRENDING_TAGS.filter(
          (t) => t.startsWith(query.toLowerCase()) && !tags.includes(t),
        ).slice(0, 5),
      );
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 30) {
      onChange([...tags, tag]);
    }
    setInputVal("");
    setSuggestions([]);
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === " ") && inputVal.trim()) {
      e.preventDefault();
      const tag = inputVal.replace(/^#/, "").toLowerCase().trim();
      if (tag) addTag(tag);
    }
    if (e.key === "Backspace" && !inputVal && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor="hashtag-input"
        className="block text-sm text-muted-foreground mb-2"
      >
        Hashtags
      </label>

      <div className="flex flex-wrap gap-2 p-2 bg-muted border border-border rounded-xl min-h-[44px] focus-within:ring-1 focus-within:ring-primary transition-all">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium"
          >
            #{t}
            <button
              onClick={() => removeTag(t)}
              className="text-primary hover:text-primary/70 transition-colors"
            >
              ×
            </button>
          </span>
        ))}

        <input
          id="hashtag-input"
          value={inputVal}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add hashtags…" : ""}
          className="flex-1 bg-transparent outline-none text-sm text-foreground min-w-[120px]"
        />
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg p-1">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTag(s);
                }}
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <span className="text-primary mr-1">#</span>
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground mt-1.5">
        {tags.length}/30 tags
      </p>
    </div>
  );
}
