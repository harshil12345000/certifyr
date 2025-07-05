import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Text,
  List,
  ImageIcon,
  Hash,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  FileText,
  File,
  Image,
  Signature,
  Table,
  QrCode,
} from "lucide-react";
import { FieldType } from "@/types/template-builder";

interface ToolbarPanelProps {
  draggable?: boolean;
  onDragStartSidebar?: (type: FieldType) => void;
}

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({
  draggable = false,
  onDragStartSidebar,
}) => {
  const fieldTypes: { id: FieldType; label: string; icon: any }[] = [
    { id: "text", label: "Text Field", icon: Text },
    { id: "number", label: "Number", icon: Hash },
    { id: "email", label: "Email", icon: Mail },
    { id: "phone", label: "Phone", icon: Phone },
    { id: "date", label: "Date", icon: Calendar },
    { id: "dropdown", label: "Dropdown", icon: ChevronDown },
    { id: "checkbox", label: "Checkbox", icon: CheckSquare },
    { id: "radio", label: "Radio Group", icon: Circle },
    { id: "textarea", label: "Text Area", icon: FileText },
    { id: "file", label: "File Upload", icon: File },
    { id: "image", label: "Image Upload", icon: Image },
    { id: "signature", label: "Signature", icon: Signature },
    { id: "table", label: "Table", icon: Table },
    { id: "qr", label: "QR Code", icon: QrCode },
  ];

  const DraggableItem = ({
    id,
    label,
    icon,
  }: {
    id: FieldType;
    label: string;
    icon: any;
  }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id,
      data: { fromSidebar: true },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white rounded-md p-3 flex items-center gap-2 shadow-sm hover:bg-gray-100 cursor-grab"
        onMouseDown={() => onDragStartSidebar?.(id)}
      >
        {icon({ className: "h-4 w-4 text-gray-500" })}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Form Elements</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Drag and drop elements to build your template.
      </p>
      <div className="flex flex-col gap-2">
        {fieldTypes.map((type) => (
          <DraggableItem
            key={type.id}
            id={type.id}
            label={type.label}
            icon={type.icon}
          />
        ))}
      </div>
    </div>
  );
};
