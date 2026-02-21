import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchOption {
  name: string;
  id: string;
  department: string;
}

interface DisambiguationCardProps {
  matches: MatchOption[];
  onSelect: (match: MatchOption) => void;
}

export function DisambiguationCard({ matches, onSelect }: DisambiguationCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50/50 overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide bg-amber-100 text-amber-700">
        Multiple matches found — Select the correct person
      </div>
      <div className="p-3 space-y-2">
        {matches.map((match, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelected(match.name);
              onSelect(match);
            }}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-md border text-left transition-colors",
              selected === match.name
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-accent"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{match.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {match.id && <span>ID: {match.id}</span>}
                {match.department && <span>• {match.department}</span>}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
