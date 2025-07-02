import { useState } from 'react';
import { useEmployeePortal } from '@/contexts/EmployeePortalContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { popularTemplates } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

// Define a minimal Template type to maintain correct typings
const allTemplatesArr = popularTemplates;
const uniqueTemplates = allTemplatesArr;

export function EmployeeTemplates() {
  const { employee } = useEmployeePortal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Filter templates based on search and category filters
  const filteredTemplates = uniqueTemplates.filter(template => {
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
  const categories: string[] = Array.from(new Set(uniqueTemplates.map(t => t.category)));

  const requestDocument = async (templateId: string) => {
    try {
      // This would normally show a form to fill template data
      // For now, we'll just create a basic request
      toast({
        title: 'Request Submitted',
        description: 'Your document request has been submitted for approval'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit request',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Document Templates</h1>
          <p className="text-muted-foreground">Browse and use our collection of legally reliable templates.</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="flex-1 flex items-center gap-2">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline" size="icon" className="md:hidden">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto md:ml-0">Clear Filters</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategories.includes(category) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <div key={template.id} className="glass-card p-5 flex flex-col">
            <div className="mb-4 flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                <Search className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-xs">
                {template.category}
              </Badge>
            </div>
            <h3 className="font-medium text-lg mb-1">{template.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
            <div className="mt-auto flex items-center justify-end">
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => requestDocument(template.id)}>
                Request <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}