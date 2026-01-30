import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { countries, GLOBAL_CONTEXT, sortedCountries } from '@/lib/countries';

interface CountryContextSelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  disabled?: boolean;
}

export function CountryContextSelector({
  selectedCountry,
  onCountryChange,
  disabled = false,
}: CountryContextSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find selected country data
  const selectedCountryData = useMemo(() => {
    if (selectedCountry === 'global' || !selectedCountry) {
      return GLOBAL_CONTEXT;
    }
    return countries.find(c => c.name === selectedCountry) || GLOBAL_CONTEXT;
  }, [selectedCountry]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return sortedCountries;
    }
    const query = searchQuery.toLowerCase();
    return sortedCountries.filter(country => 
      country.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Check if Global should be shown (always show unless search doesn't match)
  const showGlobal = useMemo(() => {
    if (!searchQuery.trim()) return true;
    return 'global'.includes(searchQuery.toLowerCase());
  }, [searchQuery]);

  const handleSelect = (countryName: string) => {
    onCountryChange(countryName);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-[280px] justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedCountryData.name === 'Global' ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <span className="text-lg">{selectedCountryData.flag}</span>
            )}
            <span>{selectedCountryData.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {/* Global option - always first */}
            {showGlobal && (
              <button
                onClick={() => handleSelect('global')}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors',
                  (selectedCountry === 'global' || !selectedCountry) && 'bg-muted'
                )}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left">Global</span>
                <span className="text-xs text-muted-foreground">No specific context</span>
                {(selectedCountry === 'global' || !selectedCountry) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            )}
            
            {showGlobal && filteredCountries.length > 0 && (
              <div className="my-1 border-t" />
            )}
            
            {/* Country list */}
            {filteredCountries.map((country) => (
              <button
                key={`${country.code}-${country.name}`}
                onClick={() => handleSelect(country.name)}
                className={cn(
                  'flex items-center gap-2 w-full px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors',
                  selectedCountry === country.name && 'bg-muted'
                )}
              >
                <span className="text-lg">{country.flag}</span>
                <span className="flex-1 text-left">{country.name}</span>
                {selectedCountry === country.name && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
            
            {!showGlobal && filteredCountries.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No countries found
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
