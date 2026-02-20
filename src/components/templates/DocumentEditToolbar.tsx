import React, { useCallback, useEffect, useState } from "react";
import { Bold, Italic, Underline, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentEditToolbarProps {
  onSaveEdits: () => void;
}

const FONTS = [
  { value: "inherit", label: "Default" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
  { value: "Georgia, serif", label: "Georgia" },
];

const SIZES = ["8", "10", "12", "14", "16", "18", "20", "24", "30", "36"];

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

export const DocumentEditToolbar: React.FC<DocumentEditToolbarProps> = ({ onSaveEdits }) => {
  const [formatStates, setFormatStates] = useState({ bold: false, italic: false, underline: false });

  const updateFormatStates = useCallback(() => {
    setFormatStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", updateFormatStates);
    document.addEventListener("mouseup", updateFormatStates);
    document.addEventListener("keyup", updateFormatStates);
    return () => {
      document.removeEventListener("selectionchange", updateFormatStates);
      document.removeEventListener("mouseup", updateFormatStates);
      document.removeEventListener("keyup", updateFormatStates);
    };
  }, [updateFormatStates]);

  const handleBold = useCallback(() => {
    execFormat("bold");
    setTimeout(updateFormatStates, 0);
  }, [updateFormatStates]);
  const handleItalic = useCallback(() => {
    execFormat("italic");
    setTimeout(updateFormatStates, 0);
  }, [updateFormatStates]);
  const handleUnderline = useCallback(() => {
    execFormat("underline");
    setTimeout(updateFormatStates, 0);
  }, [updateFormatStates]);

  const handleFont = useCallback((value: string) => {
    execFormat("fontName", value);
  }, []);

  const handleSize = useCallback((value: string) => {
    // execCommand fontSize only accepts 1-7; use insertHTML with span instead
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = `${value}px`;
      range.surroundContents(span);
      sel.removeAllRanges();
    }
  }, []);

  const handleColor = useCallback((color: string) => {
    execFormat("foreColor", color);
  }, []);

  return (
    <div className="w-[95%] mx-auto flex items-center gap-2 flex-wrap p-2 bg-muted/80 backdrop-blur-sm border rounded-lg mb-3 sticky top-20 z-50">
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
              className={`h-8 w-8 ${formatStates.bold ? "bg-blue-500/50 hover:bg-blue-500/50" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleBold();
              }}
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
              className={`h-8 w-8 ${formatStates.italic ? "bg-blue-500/50 hover:bg-blue-500/50" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleItalic();
              }}
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
              className={`h-8 w-8 ${formatStates.underline ? "bg-blue-500/50 hover:bg-blue-500/50" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handleUnderline();
              }}
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

      {/* Font Size */}
      <Select onValueChange={handleSize}>
        <SelectTrigger className="h-8 w-[72px] text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {SIZES.map((s) => (
            <SelectItem key={s} value={s} className="text-xs">
              {s}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
