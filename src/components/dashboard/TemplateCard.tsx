import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Bookmark, BookmarkCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useBookmarks } from "@/hooks/useBookmarks";

export interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  usageCount?: number;
  className?: string;
  isAdmin?: boolean;
  forceBookmarked?: boolean;
  onBookmarkClick?: (e: React.MouseEvent) => void;
}

export function TemplateCard({
  id,
  title,
  description,
  category,
  className,
  isAdmin = false,
  forceBookmarked = false,
  onBookmarkClick,
}: TemplateCardProps) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = forceBookmarked || isBookmarked(id);
  return (
    <div className={cn("glass-card p-5 flex flex-col", className)}>
      <div className="mb-4 flex items-start justify-between">
        <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
          {isAdmin && (
            <button
              aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
              className="ml-2 p-1 rounded hover:bg-primary-100 transition-colors"
              onClick={(e) => {
                if (onBookmarkClick) return onBookmarkClick(e);
                e.stopPropagation();
                e.preventDefault();
                bookmarked ? removeBookmark(id) : addBookmark(id);
              }}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-5 w-5 text-primary-500" />
              ) : (
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>
      <h3 className="font-medium text-lg mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="mt-auto flex items-center justify-end">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to={`/templates/${id}`}>
            Use <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
