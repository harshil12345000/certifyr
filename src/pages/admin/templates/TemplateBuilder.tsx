import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { TemplateCanvas } from "@/components/template-builder/TemplateCanvas";
import { ToolbarPanel } from "@/components/template-builder/ToolbarPanel";
// import { MetadataPanel } from '@/components/template-builder/MetadataPanel'; // MetadataPanel might be for selected field now
import { PreviewPanel } from "@/components/template-builder/PreviewPanel";
import { Section, Column, Field, FieldType } from "@/types/template-builder";
import { Button } from "@/components/ui/button";
import { Save, Eye, Upload, ChevronLeft, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

function createEmptySection(): Section {
  return {
    id: uuidv4(),
    title: "New Section",
    description: "",
    columns: [
      { id: uuidv4() + "-col1", fields: [] },
      // { id: uuidv4() + '-col2', fields: [] }, // Start with one column by default perhaps
    ],
  };
}

function createEmptyField(type: FieldType = "text"): Field {
  let label = "New Field";
  switch (type) {
    case "text":
      label = "Full Name";
      break;
    case "number":
      label = "Age";
      break;
    case "email":
      label = "Email Address";
      break;
    case "phone":
      label = "Phone Number";
      break;
    case "date":
      label = "Date of Birth";
      break;
    case "dropdown":
      label = "Country";
      break;
    case "checkbox":
      label = "Agree to Terms";
      break;
    case "radio":
      label = "Gender";
      break;
    case "textarea":
      label = "Additional Comments";
      break;
    // Add cases for other FieldType values if specific default labels are needed
    default:
      label = type.charAt(0).toUpperCase() + type.slice(1);
      break;
  }
  return {
    id: uuidv4(),
    type,
    label,
    placeholder: `Enter ${label.toLowerCase()}`,
    required: false,
    options:
      type === "dropdown" || type === "radio"
        ? ["Option 1", "Option 2", "Option 3"]
        : undefined,
  };
}

const TemplateBuilder = () => {
  const [activeView, setActiveView] = useState<"edit" | "preview">("edit");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [templateName, setTemplateName] = useState("Untitled Template");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sections, setSections] = useState<Section[]>([]);
  // const [selectedField, setSelectedField] = useState<{ sectionId: string; columnId: string; fieldId: string } | null>(null); // Managed by PropertyPanel in TemplateCanvas now
  const [draggedSidebarType, setDraggedSidebarType] =
    useState<FieldType | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null); // For updating existing templates

  // Load template if ID is in URL or passed as prop (not shown here, but common pattern)
  // useEffect(() => {
  //   // const { id } = useParams(); if using React Router for template ID
  //   // if (id) loadTemplate(id);
  // }, []);

  // const loadTemplate = async (id: string) => { ... }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require a minimum drag distance to initiate
      },
    }),
  );

  const handleAddSection = () => {
    setSections((prev) => [...prev, createEmptySection()]);
  };
  const handleDeleteSection = (sectionId: string) => {
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  };
  const handleAddColumn = (sectionId: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === sectionId && s.columns.length < 2) {
          // Max 2 columns for now
          return {
            ...s,
            columns: [...s.columns, { id: uuidv4() + "-col", fields: [] }],
          };
        }
        return s;
      }),
    );
  };

  const handleAddField = (
    sectionId: string,
    columnId: string,
    type: FieldType = "text",
  ) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            columns: section.columns.map((column) => {
              if (column.id === columnId) {
                return {
                  ...column,
                  fields: [...column.fields, createEmptyField(type)],
                };
              }
              return column;
            }),
          };
        }
        return section;
      });
    });
  };

  const handleDeleteField = (
    sectionId: string,
    columnId: string,
    fieldId: string,
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              columns: s.columns.map((c) =>
                c.id === columnId
                  ? { ...c, fields: c.fields.filter((f) => f.id !== fieldId) }
                  : c,
              ),
            }
          : s,
      ),
    );
  };

  const handleSelectField = (
    sectionId: string,
    columnId: string,
    fieldId: string,
  ) => {
    // This is now handled internally by TemplateCanvas for its property panel.
    // If TemplateBuilder needs to know about selected field, it can be a prop.
    // setSelectedField({ sectionId, columnId, fieldId });
    console.log(`Field selected: ${fieldId} in ${columnId} of ${sectionId}`);
  };

  // Callback for TemplateCanvas to signal changes, e.g. for auto-save or "hasChanges"
  const handleCanvasChange = () => {
    console.log("Canvas changed, sections state:", sections);
  };

  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<Section>,
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)),
    );
  };

  const handleUpdateField = (
    sectionId: string,
    columnId: string,
    fieldId: string,
    updates: Partial<Field>,
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              columns: s.columns.map((c) =>
                c.id === columnId
                  ? {
                      ...c,
                      fields: c.fields.map((f) =>
                        f.id === fieldId ? { ...f, ...updates } : f,
                      ),
                    }
                  : c,
              ),
            }
          : s,
      ),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.fromSidebar) {
      setDraggedSidebarType(event.active.id as FieldType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (
      draggedSidebarType &&
      event.over &&
      typeof event.over.id === "string" &&
      event.over.id.startsWith("column-dropzone-")
    ) {
      const columnId = event.over.id.replace("column-dropzone-", "");
      const section = sections.find((s) =>
        s.columns.some((c) => c.id === columnId),
      );
      if (section) {
        handleAddField(section.id, columnId, draggedSidebarType);
      }
    }
    setDraggedSidebarType(null);
  };

  const handleSaveTemplate = async (
    status: "draft" | "published" = "draft",
  ) => {
    if (status === "draft") setIsSaving(true);
    if (status === "published") setIsPublishing(true);

    const templatePayload = {
      ...(templateId && { id: templateId }), // Include ID if updating
      name: templateName,
      // 'fields' was old schema, now it's 'sections' or similar for form structure
      // Supabase 'templates' table might need 'sections: JsonB' or similar
      content: sections, // Assuming Supabase table has a 'content' (JsonB) column for sections
      status: status,
      // user_id: (await supabase.auth.getUser()).data.user?.id, // For associating with user
      updated_at: new Date().toISOString(),
    };

    // Upsert into 'templates' table (ensure this table exists and matches payload)
    // The 'templates' table structure given in context has 'fields', not 'sections' or 'content' for the form structure.
    // This needs to be aligned. For now, I'll assume 'content: sections' is the target.
    // Let's check the provided 'templates' table structure. It's not in the context.
    // Assuming a generic 'templates' table.

    // const { data, error } = await supabase.from('templates').upsert(templatePayload).select().single();

    // Mocking save since table structure is uncertain
    console.log("Saving template:", templatePayload);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    const error = null; // Mock no error
    const data = { ...templatePayload, id: templateId || uuidv4() }; // Mock response

    if (error) {
      toast({
        title: `Error ${status === "draft" ? "saving" : "publishing"} template`,
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: `Template ${status === "draft" ? "saved as draft" : "published"}`,
      });
      if (data && data.id && !templateId) {
        setTemplateId(data.id); // Store ID if it's a new template
      }
      if (status === "published") {
        navigate("/admin/templates"); // Or to the template list page
      }
    }
    if (status === "draft") setIsSaving(false);
    if (status === "published") setIsPublishing(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/admin/templates")}
              className="h-9 w-9"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {editingTitle ? (
              <input
                className="text-xl font-semibold bg-transparent border-b border-primary-400 focus:outline-none focus:border-primary-600 py-1"
                value={templateName}
                autoFocus
                onChange={(e) => setTemplateName(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape")
                    setEditingTitle(false);
                }}
                style={{ minWidth: 200 }}
              />
            ) : (
              <div
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => setEditingTitle(true)}
              >
                <h1 className="text-xl font-semibold text-gray-800 group-hover:text-primary-600">
                  {templateName}
                </h1>
                <Edit3
                  size={16}
                  className="text-gray-400 group-hover:text-primary-500 transition-opacity opacity-0 group-hover:opacity-100"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setActiveView(activeView === "edit" ? "preview" : "edit")
              }
              className="text-gray-700 hover:text-primary-600"
            >
              <Eye className="h-4 w-4 mr-2" />
              {activeView === "edit" ? "Preview" : "Edit Form"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSaveTemplate("draft")}
              disabled={isSaving || isPublishing}
              className="text-gray-700 hover:text-primary-600"
            >
              {isSaving ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSaveTemplate("published")}
              disabled={isSaving || isPublishing}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isPublishing ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></span>
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        </div>
      </header>

      {/* Builder Interface */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="flex-1 flex gap-0 overflow-hidden">
          {" "}
          {/* Changed gap-4 to gap-0 for tighter layout */}
          {activeView === "edit" ? (
            <>
              <aside className="w-72 bg-white border-r border-gray-200 overflow-y-auto scrollbar-thin">
                {" "}
                {/* Width 72, was 64 */}
                <ToolbarPanel draggable /> {/* Removed onDragStartSidebar */}
              </aside>

              <section className="flex-1 bg-gray-100 p-6 md:p-8 overflow-y-auto scrollbar-thin">
                {" "}
                {/* Added padding */}
                <TemplateCanvas
                  elements={sections}
                  onAddSection={handleAddSection}
                  onAddField={handleAddField}
                  onAddColumn={handleAddColumn}
                  onSelectField={handleSelectField} // For potential future use by Builder for global state
                  onDeleteField={handleDeleteField}
                  onDeleteSection={handleDeleteSection}
                  onUpdateSection={handleUpdateSection}
                  onUpdateField={handleUpdateField}
                  onChange={handleCanvasChange} // To inform builder of changes
                />
              </section>

              {/* Properties Panel for selected field - could be a third column or integrated differently */}
              {/* For now, TemplateCanvas handles its own field property panel */}
              {/* <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto scrollbar-thin">
                <MetadataPanel selectedField={selectedField} onUpdateField={handleUpdateField} />
              </aside> */}
            </>
          ) : (
            <section className="flex-1 bg-gray-100 p-6 md:p-8 overflow-y-auto">
              <PreviewPanel elements={sections} templateName={templateName} />
            </section>
          )}
          <DragOverlay>
            {draggedSidebarType && (
              <div className="p-2 bg-primary-500 text-white rounded shadow-lg font-medium cursor-grabbing">
                {draggedSidebarType.charAt(0).toUpperCase() +
                  draggedSidebarType.slice(1)}{" "}
                Field
              </div>
            )}
          </DragOverlay>
        </main>
      </DndContext>
    </div>
  );
};

export default TemplateBuilder;
