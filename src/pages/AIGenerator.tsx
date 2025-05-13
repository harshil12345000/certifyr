
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { AIDocumentGenerator } from "@/components/ai/AIDocumentGenerator";

const AIGenerator = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-1">AI Document Generator</h1>
          <p className="text-muted-foreground">
            Generate legal document templates using AI and the Indian Kanoon database
          </p>
        </div>
        
        <AIDocumentGenerator />
      </div>
    </DashboardLayout>
  );
};

export default AIGenerator;
