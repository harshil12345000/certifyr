
import { Button } from '@/components/ui/button';
import { ElementType as BuilderElementType } from '@/types/template-builder'; // Renamed to avoid conflict if ElementType is used locally
import { defaultElementStyle } from '@/lib/defaults'; // defaultElementStyle might not be directly used here anymore if we simplify
import { v4 as uuidv4 } from 'uuid';
import { useDraggable } from '@dnd-kit/core'; // Changed from Draggable component
import {
  Type, Heading1, Image as ImageIcon, Replace, Table, QrCode, Minus, Pilcrow // Renamed Image to ImageIcon
} from 'lucide-react';

interface ToolbarPanelProps {
  // onAddElement was for a different builder type, this panel is for Form Builder (Sections/Fields)
  // The primary action is dragging elements, which is handled by dnd-kit.
  // If clicking directly adds a field (non-draggable mode), that would need a specific handler.
  // For now, assuming draggable is primary.
  // onAddElement: (element: { id: string; type: BuilderElementType; content: string; style: any; }) => void; // Commenting out, seems legacy
  draggable?: boolean;
  // onDragStartSidebar prop is removed, DndContext.onDragStart in parent handles this
}

const tools = [
  { name: 'Text', icon: <Pilcrow size={18} />, type: 'text' as BuilderElementType },
  { name: 'Heading', icon: <Heading1 size={18} />, type: 'heading' as BuilderElementType }, // 'heading' is a field type, not element type
  { name: 'Image', icon: <ImageIcon size={18} />, type: 'image' as BuilderElementType },
  { name: 'Placeholder', icon: <Replace size={18} />, type: 'placeholder' as BuilderElementType }, // Placeholder is fine as a field type
  { name: 'Signature', icon: <Type size={18} />, type: 'signature' as BuilderElementType },
  { name: 'Table', icon: <Table size={18} />, type: 'table' as BuilderElementType },
  { name: 'QR Code', icon: <QrCode size={18} />, type: 'qr' as BuilderElementType }, // Changed from 'qr' to avoid conflict with FieldType.qr
  { name: 'Divider', icon: <Minus size={18} />, type: 'divider' as BuilderElementType },
];
// Note: The 'type' here for tools (BuilderElementType) might need to align with FieldType from types/template-builder.ts
// For example, 'text' from tools should map to 'text' in FieldType.
// 'heading' isn't a FieldType, could be a special 'text' field with styling or a 'richtext'.
// For now, these types are passed to dnd-kit and used by TemplateBuilder to create a field.


interface DraggableToolProps {
  tool: { name: string; icon: JSX.Element; type: string };
}

const DraggableToolButton: React.FC<DraggableToolProps> = ({ tool }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: tool.type, // This ID is used by DndContext onDragStart/End to identify the type
    data: { fromSidebar: true, type: tool.type }, // Pass type in data for clarity in handler
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 100, // Ensure dragged item is on top
  } : undefined;

  return (
    <Button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      variant="outline"
      className="w-full justify-start text-sm py-2 h-auto bg-white" // Added bg-white for visibility if dragged
    >
      <span className="mr-2">{tool.icon}</span>
      {tool.name}
    </Button>
  );
};


export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({ draggable = false }) => {
  // const handleAdd = (elementType: BuilderElementType) => { // This was for non-draggable version
  //   const newElement = {
  //     id: uuidv4(),
  //     type: elementType,
  //     content: `Sample ${elementType}`, // Content might be initial label or placeholder
  //     style: { ...defaultElementStyle, x: 50, y: 50 }, // Style is not applicable to Fields in Sections
  //   };
  //   // onAddElement(newElement); // onAddElement is removed from props
  // };

  if (draggable) {
    return (
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm mb-2 px-1 text-gray-600">DRAG TO ADD FIELD</h3>
        {tools.map((tool) => (
          <DraggableToolButton key={tool.name} tool={tool} />
        ))}
      </div>
    );
  }

  // Fallback for non-draggable mode (if ever needed)
  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-sm mb-1 px-1 text-gray-600">ELEMENTS (Click to add - TBD)</h3>
      {tools.map((tool) => (
        <Button
          key={tool.name}
          variant="ghost"
          className="w-full justify-start text-sm py-2 h-auto"
          // onClick={() => handleAdd(tool.type as BuilderElementType)} // handleAdd needs onAddElement prop
          disabled // Click-to-add functionality needs to be re-evaluated for Form Builder
        >
          <span className="mr-2">{tool.icon}</span>
          {tool.name}
        </Button>
      ))}
    </div>
  );
};

