import { Button } from '@/components/ui/button';
import { ElementType, Section } from '@/types/template-builder';
import { defaultElementStyle } from '@/lib/defaults';
import { v4 as uuidv4 } from 'uuid';
import { Draggable } from '@dnd-kit/core';
import {
  Type, Heading1, Image, Replace, Table, QrCode, Minus, Pilcrow
} from 'lucide-react';

interface ToolbarPanelProps {
  onAddElement: (element: { id: string; type: ElementType; content: string; style: any; /* autres props si besoin */ }) => void;
  draggable?: boolean;
  onDragStartSidebar?: (type: string) => void;
}

const tools = [
  { name: 'Text', icon: <Pilcrow size={18} />, type: 'text' as ElementType },
  { name: 'Heading', icon: <Heading1 size={18} />, type: 'heading' as ElementType },
  { name: 'Image', icon: <Image size={18} />, type: 'image' as ElementType },
  { name: 'Placeholder', icon: <Replace size={18} />, type: 'placeholder' as ElementType },
  { name: 'Signature', icon: <Type size={18} />, type: 'signature' as ElementType },
  { name: 'Table', icon: <Table size={18} />, type: 'table' as ElementType },
  { name: 'QR Code', icon: <QrCode size={18} />, type: 'qr' as ElementType },
  { name: 'Divider', icon: <Minus size={18} />, type: 'divider' as ElementType },
];

export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({ onAddElement, draggable = false, onDragStartSidebar }) => {
  const handleAdd = (elementType: ElementType) => {
    const newElement = {
      id: uuidv4(),
      type: elementType,
      content: `Sample ${elementType}`,
      style: { ...defaultElementStyle, x: 50, y: 50 },
    };
    onAddElement(newElement);
  };

  if (draggable && onDragStartSidebar) {
    return (
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-sm mb-2 px-1">DRAG TO ADD</h3>
        {tools.map((tool) => (
          <Draggable key={tool.name} id={tool.type} data={{ fromSidebar: true, type: tool.type }}>
            <Button
              variant="outline"
              className="w-full justify-start text-sm py-2 h-auto"
              onMouseDown={() => onDragStartSidebar(tool.type)}
            >
              <span className="mr-2">{tool.icon}</span>
              {tool.name}
            </Button>
          </Draggable>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h3 className="font-semibold text-sm mb-1 px-1">ELEMENTS</h3>
      {tools.map((tool) => (
        <Button
          key={tool.name}
          variant="ghost"
          className="w-full justify-start text-sm py-2 h-auto"
          onClick={() => handleAdd(tool.type)}
        >
          <span className="mr-2">{tool.icon}</span>
          {tool.name}
        </Button>
      ))}
    </div>
  );
};
