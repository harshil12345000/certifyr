import React, { useCallback, useState, useEffect } from "react";
import { Bold, Italic, Underline, Save, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentEditToolbarProps {
  onSaveEdits: () => void;
}

const FONTS = [
  { value: "inherit", label: "Default" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
];

const SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 30, 36];

const COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#4B5563", label: "Dark Gray" },
  { value: "#DC2626", label: "Red" },
  { value: "#2563EB", label: "Blue" },
  { value: "#16A34A", label: "Green" },
  { value: "#EA580C", label: "Orange" },
  { value: "#9333EA", label: "Purple" },
  { value: "#92400E", label: "Brown" },
  { value: "#EC4899", label: "Pink" },
  { value: "#1E3A5F", label: "Navy" },
];

const execFormat = (command: string, value?: string) => {
  document.execCommand(command, false, value);
};

export const DocumentEditToolbar: React.FC<DocumentEditToolbarProps> = ({
  onSaveEdits,
}) => {
  const [fontSize, setFontSize] = useState(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Poll active formatting state from selection
  useEffect(() => {
    const update = () => {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  const handleBold = useCallback(() => { execFormat("bold"); setIsBold(document.queryCommandState("bold")); }, []);
  const handleItalic = useCallback(() => { execFormat("italic"); setIsItalic(document.queryCommandState("italic")); }, []);
  const handleUnderline = useCallback(() => { execFormat("underline"); setIsUnderline(document.queryCommandState("underline")); }, []);

  const handleFont = useCallback((value: string) => {
    execFormat("fontName", value);
  }, []);

  const applyFontSize = useCallback((size: number) => {
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const span = document.createElement("span");
        span.style.fontSize = `${size}px`;
        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
      }
    } catch {
      // Silently handle invalid selections
    }
  }, []);

  const stepSize = useCallback((dir: 1 | -1) => {
    const idx = SIZES.indexOf(fontSize);
    const next = idx === -1
      ? (dir === 1 ? 16 : 12)
      : SIZES[Math.max(0, Math.min(SIZES.length - 1, idx + dir))];
    applyFontSize(next);
    setFontSize(next);
  }, [fontSize, applyFontSize]);

  const handleColor = useCallback((color: string) => {
    execFormat("foreColor", color);
  }, []);

  return (
    <div className="flex items-center gap-2 flex-wrap p-2 bg-muted/80 backdrop-blur-sm border rounded-lg mb-3">
      {/* Save Edits */}
      <Button size="sm" variant="default" onClick={onSaveEdits}>
        <Save className="mr-1.5 h-3.5 w-3.5" />
        Save Edits
      </Button>

      <div className="w-px h-6 bg-border" />

      {/* Bold / Italic / Underline */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 ${isBold ? "bg-primary/15 text-primary" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); handleBold(); }}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 ${isItalic ? "bg-primary/15 text-primary" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); handleItalic(); }}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={`h-8 w-8 ${isUnderline ? "bg-primary/15 text-primary" : ""}`}
              onMouseDown={(e) => { e.preventDefault(); handleUnderline(); }}
            >
              <Underline className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Underline</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-px h-6 bg-border" />

      {/* Font Family */}
      <Select onValueChange={handleFont}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONTS.map((f) => (
            <SelectItem key={f.value} value={f.value} className="text-xs">
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size +/- */}
      <div className="flex items-center gap-0.5">
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onMouseDown={(e) => { e.preventDefault(); stepSize(-1); }}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <span className="w-8 text-center text-xs font-medium select-none border border-border rounded px-1 py-0.5">
          {fontSize}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onMouseDown={(e) => { e.preventDefault(); stepSize(1); }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* Color Swatches */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <Tooltip key={c.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="h-5 w-5 rounded-full border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleColor(c.value);
                  }}
                  aria-label={c.label}
                />
              </TooltipTrigger>
              <TooltipContent>{c.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
};
