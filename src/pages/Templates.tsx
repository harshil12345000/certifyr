
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TemplateCard } from '@/components/dashboard/TemplateCard';
import { documentCategories } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Filter, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { popularTemplates } from '@/data/mockData';

// Updated templates with removed ones and added new templates including corporate templates
const allTemplates = [...popularTemplates, {
  id: "embassy-attestation-1",
  title: "Embassy Attestation Letter",
  description: "Letter for document attestation at embassies",
  category: "Travel",
  usageCount: 31
}, {
  id: "completion-certificate-1",
  title: "Completion Certificate",
  description: "Certificate for courses, training programs, internships",
  category: "Educational",
  usageCount: 28
}, {
  id: "transfer-certificate-1",
  title: "Transfer Certificate",
  description: "Certificate for students moving between institutions",
  category: "Educational",
  usageCount: 25
}, {
  id: "noc-visa-1",
  title: "NOC for Visa Application",
  description: "No Objection Certificate for visa applications",
  category: "Travel",
  usageCount: 24
}, {
  id: "income-certificate-1",
  title: "Income Certificate",
  description: "Certificate stating employee income details",
  category: "Employment",
  usageCount: 23
}, {
  id: "maternity-leave-1",
  title: "Maternity Leave Application",
  description: "Application for maternity leave benefits",
  category: "Employment",
  usageCount: 22
}, {
  id: "bank-verification-1",
  title: "Bank Account Verification",
  description: "Letter confirming account details for banks",
  category: "Financial",
  usageCount: 19
}, {
  id: "offer-letter-1",
  title: "Offer Letter",
  description: "Formal job offer letter to candidates",
  category: "Employment",
  usageCount: 18
}, {
  id: "address-proof-1",
  title: "Address Proof Certificate",
  description: "Certificate verifying residential address",
  category: "Legal",
  usageCount: 0
}, {
  id: "articles-incorporation-1",
  title: "Articles of Incorporation",
  description: "Certificate of Incorporation for new corporations",
  category: "Corporate",
  usageCount: 15
}, {
  id: "corporate-bylaws-1",
  title: "Corporate Bylaws",
  description: "Corporate governance and operating procedures",
  category: "Corporate",
  usageCount: 12
}, {
  id: "founders-agreement-1",
  title: "Founders' Agreement",
  description: "Agreement between company founders",
  category: "Corporate",
  usageCount: 10
}, {
  id: "stock-purchase-agreement-1",
  title: "Stock Purchase Agreement",
  description: "Agreement for purchasing company shares",
  category: "Corporate",
  usageCount: 8
}, {
  id: "employment-agreement-1",
  title: "Employment Agreement",
  description: "Comprehensive employment contract",
  category: "Corporate",
  usageCount: 14
}, {
  id: "nda-1",
  title: "Non-Disclosure Agreement (NDA)",
  description: "Confidentiality agreement between parties",
  category: "Corporate",
  usageCount: 16
}];

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  // Filter templates based on search and category filters
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) || template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(template.category);
    return matchesSearch && matchesCategory;
  });

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const categories = Array.from(new Set(allTemplates.map(t => t.category)));

  const handleCreateTemplate = () => {
    navigate('/template-builder');
  };

  // Function to handle category card clicks
  const handleCategoryClick = (categoryName: string) => {
    // Map display names to actual category names used in templates
    const categoryMapping: { [key: string]: string } = {
      'Student Documents': 'Academic',
      'Employment Records': 'Employment', 
      'Official Certificates': 'General',
      'Financial Documents': 'Financial',
      'Travel & Visa': 'Travel',
      'Miscellaneous': 'Legal'
    };

    const actualCategory = categoryMapping[categoryName] || categoryName;
    setSelectedCategories([actualCategory]);
    setSearchQuery('');
  };

  // Calculate real template counts for each category
  const getCategoryCount = (categoryName: string) => {
    const categoryMapping: { [key: string]: string } = {
      'Student Documents': 'Academic',
      'Employment Records': 'Employment', 
      'Official Certificates': 'General',
      'Financial Documents': 'Financial',
      'Travel & Visa': 'Travel',
      'Miscellaneous': 'Legal'
    };

    const actualCategory = categoryMapping[categoryName] || categoryName;
    return allTemplates.filter(template => template.category === actualCategory).length;
  };

  return <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Document Templates</h1>
            <p className="text-muted-foreground">Browse and use our collection of legally compliant templates</p>
          </div>
          
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search templates..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {selectedCategories.length > 0 && <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                      {selectedCategories.length}
                    </Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Categories</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map(category => <DropdownMenuCheckboxItem key={category} checked={selectedCategories.includes(category)} onCheckedChange={() => toggleCategory(category)}>
                    {category}
                  </DropdownMenuCheckboxItem>)}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearFilters}>
                  Clear filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Template Categories */}
        <div className="glass-card p-5">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="recent">Recently Used</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-0">
              {/* Selected filters */}
              {selectedCategories.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                  {selectedCategories.map(category => <Badge key={category} variant="secondary" className="flex items-center gap-1">
                      {category}
                      <button onClick={() => toggleCategory(category)} className="hover:bg-muted rounded-full ml-1 h-4 w-4 flex items-center justify-center">
                        <span className="sr-only">Remove</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </Badge>)}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                    Clear all
                  </Button>
                </div>}

              {filteredTemplates.length === 0 ? <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No templates found</h3>
                  <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria</p>
                </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTemplates.map(template => <TemplateCard key={template.id} id={template.id} title={template.title} description={template.description} category={template.category} />)}
                </div>}
            </TabsContent>
            <TabsContent value="recent" className="mt-0">
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium">Recent templates will appear here</h3>
                <p className="text-muted-foreground mt-1">Start using templates to see them here</p>
              </div>
            </TabsContent>
            <TabsContent value="favorites" className="mt-0">
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium">No favorite templates yet</h3>
                <p className="text-muted-foreground mt-1">Mark templates as favorites to see them here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Template Categories */}
        <h2 className="text-lg font-medium mt-8 mb-4">Browse Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentCategories.map(category => {
          const Icon = category.icon;
          const realCount = getCategoryCount(category.name);
          return <div 
                key={category.id} 
                className="glass-card p-5 flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="mb-2">
                  <Badge variant="outline" className="bg-primary-50 border-primary-200 text-primary-700">
                    {realCount} Templates
                  </Badge>
                </div>
                <h3 className="font-medium text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-grow">{category.description}</p>
                <Button variant="ghost" className="justify-start p-0 hover:bg-transparent hover:text-primary-600" size="sm">
                  View category <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>;
        })}
        </div>
      </div>
    </DashboardLayout>;
};
export default Templates;
