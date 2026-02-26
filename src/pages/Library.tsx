import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useLibraryDocuments,
  useLibraryFilterOptions,
  useLibraryTags,
  LibraryDocument,
} from "@/hooks/useLibrary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sortedCountries } from "@/lib/countries";
import {
  Search,
  ExternalLink,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Building2,
  Check,
  X,
} from "lucide-react";

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  India: "🇮🇳",
  UK: "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
};

const TAG_COLORS: Record<string, string> = {
  country: "bg-blue-50 border-blue-300 text-blue-700",
  state: "bg-gray-50 border-gray-300 text-gray-700",
  domain: "bg-purple-50 border-purple-300 text-purple-700",
  authority: "bg-green-50 border-green-300 text-green-700",
  industry: "bg-orange-50 border-orange-300 text-orange-700",
};

function DocumentCard({ document }: { document: LibraryDocument }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-2">
          <span className="text-2xl">
            {COUNTRY_FLAGS[document.country] || "🌐"}
          </span>

          {document.state && (
            <Badge variant="outline" className="text-xs">
              <MapPin className="w-3 h-3 mr-1" />
              {document.state}
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg font-semibold line-clamp-2 mt-2">
          {document.form_name || document.official_name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={`${TAG_COLORS.domain} border text-xs`}
          >
            {document.domain}
          </Badge>

          <Badge
            variant="outline"
            className={`${TAG_COLORS.authority} border text-xs`}
          >
            <Building2 className="w-3 h-3 mr-1" />
            {document.authority}
          </Badge>
        </div>

        <CardDescription className="line-clamp-2 text-sm">
          {document.short_description ||
            document.full_description ||
            "No description available"}
        </CardDescription>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Version: {document.version}</span>

          {document.last_verified_at && (
            <span>
              Verified:{" "}
              {new Date(document.last_verified_at).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1">
            <Link to={`/library/${document.slug}`}>View Details</Link>
          </Button>

          {document.official_source_url && (
            <Button asChild size="sm" variant="outline">
              <a
                href={document.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}

          {document.official_pdf_url && (
            <Button asChild size="sm" variant="outline">
              <a
                href={document.official_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileDown className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Library() {
  const [filters, setFilters] = useState({
    country: "all",
    state: "all",
    domain: "all",
    authority: "all",
    search: "",
    page: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");

  const filteredCountries = countrySearch.trim()
    ? sortedCountries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : sortedCountries.slice(0, 20);

  useEffect(() => {
    const savedCountry = localStorage.getItem("library_selected_country");
    if (savedCountry) {
      setFilters((prev) => ({ ...prev, country: savedCountry }));
      setSelectedCountry(savedCountry);
    } else {
      setShowCountryModal(true);
    }
  }, []);

  const handleCountrySelect = (countryName: string) => {
    const countryValue = countryName === "global" ? "all" : countryName;
    setFilters((prev) => ({ ...prev, country: countryValue }));
    setSelectedCountry(countryValue);
    localStorage.setItem("library_selected_country", countryValue);
    setShowCountryModal(false);
  };

  const { data, isLoading } = useLibraryDocuments({
    country: filters.country === "all" ? undefined : filters.country,
    state: filters.state === "all" ? undefined : filters.state,
    domain: filters.domain === "all" ? undefined : filters.domain,
    authority: filters.authority === "all" ? undefined : filters.authority,
    search: filters.search || undefined,
    page: filters.page,
  });

  const { data: filterOptions, isLoading: filtersLoading } =
    useLibraryFilterOptions();
  const { data: allTags } = useLibraryTags();

  const countries = filterOptions?.countries || [];
  const states = filterOptions?.states || [];
  const domains = filterOptions?.domains || [];
  const authorities = filterOptions?.authorities || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
      page: 1,
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const updated = {
        ...prev,
        [key]: value,
        page: 1,
      };

      // Reset state when country changes
      if (key === "country") {
        updated.state = "all";
      }

      return updated;
    });
  };

  const clearFilters = () => {
    setFilters({
      country: "all",
      state: "all",
      domain: "all",
      authority: "all",
      search: "",
      page: 1,
    });
    setSearchInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-1 flex justify-center">
          <Link to="/">
            <img src="/uploads/Certifyr Black Logotype.png" alt="Certifyr" className="h-12" />
          </Link>
        </div>
      </header>

      <Dialog open={showCountryModal} onOpenChange={setShowCountryModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Your Country</DialogTitle>
            <DialogDescription>
              Choose your country to see relevant legal documents and forms. 
              You can change this anytime using the filter.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              placeholder="Search country..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="w-full"
              autoFocus
            />
            <div className="border rounded-md max-h-[300px] overflow-y-auto">
              <button
                onClick={() => handleCountrySelect("global")}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left ${selectedCountry === "all" || selectedCountry === "" ? "bg-muted" : ""}`}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">Global / All Countries</span>
                {(selectedCountry === "all" || selectedCountry === "") && <Check className="h-4 w-4" />}
              </button>
              <div className="border-t" />
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left ${selectedCountry === country.name ? "bg-muted" : ""}`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1">{country.name}</span>
                  {selectedCountry === country.name && <Check className="h-4 w-4" />}
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                  No countries found
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Legal Library</h1>
          <p className="text-muted-foreground mt-1">
            Browse and explore legal documents, forms, and compliance
            requirements
          </p>
        </div>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3">
          <Select
            value={filters.country}
            onValueChange={(v) => handleFilterChange("country", v)}
          >
            <SelectTrigger className="w-[180px]" disabled={filtersLoading}>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {countries.filter(Boolean).map((c) => (
                <SelectItem key={c} value={c}>
                  {COUNTRY_FLAGS[c] || ""} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.state}
            onValueChange={(v) => handleFilterChange("state", v)}
            disabled={filters.country === "all"}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {states.filter(Boolean).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.domain}
            onValueChange={(v) => handleFilterChange("domain", v)}
          >
            <SelectTrigger className="w-[180px]" disabled={filtersLoading}>
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.filter(Boolean).map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.authority}
            onValueChange={(v) => handleFilterChange("authority", v)}
          >
            <SelectTrigger className="w-[180px]" disabled={filtersLoading}>
              <SelectValue placeholder="All Authorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Authorities</SelectItem>
              {authorities.filter(Boolean).map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(filters.country !== "all" ||
            filters.state !== "all" ||
            filters.domain !== "all" ||
            filters.authority !== "all" ||
            filters.search) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>

        {/* RESULTS */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No documents found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.documents.map((doc) => (
                <DocumentCard key={doc.id} document={doc} />
              ))}
            </div>

            {data?.pagination &&
              data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Page {filters.page} of {data.pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      filters.page >= data.pagination.totalPages
                    }
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}