
import { useRef, useState, useEffect } from 'react';
import { TemplateElement } from '@/types/template-builder';

interface TemplateCanvasProps {
  elements: TemplateElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<TemplateElement>) => void;
  onDeleteElement: (id: string) => void;
  onChange: () => void;
}

export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElement) return;
      
      // Delete with Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteElement(selectedElement);
      }
      
      // Arrow keys to move selected element
      const moveDelta = e.shiftKey ? 10 : 1; // Move faster with shift
      const element = elements.find(el => el.id === selectedElement);
      
      if (!element) return;
      
      if (e.key === 'ArrowUp') {
        onUpdateElement(selectedElement, { style: { ...element.style, y: Math.max(0, element.style.y - moveDelta) } });
        onChange();
      }
      if (e.key === 'ArrowDown') {
        onUpdateElement(selectedElement, { style: { ...element.style, y: element.style.y + moveDelta } });
        onChange();
      }
      if (e.key === 'ArrowLeft') {
        onUpdateElement(selectedElement, { style: { ...element.style, x: Math.max(0, element.style.x - moveDelta) } });
        onChange();
      }
      if (e.key === 'ArrowRight') {
        onUpdateElement(selectedElement, { style: { ...element.style, x: element.style.x + moveDelta } });
        onChange();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, elements, onDeleteElement, onUpdateElement, onChange]);
  
  // Handle element dragging
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectElement(id);
    
    const element = elements.find(el => el.id === id);
    if (!element) return;
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement || !canvasRef.current) return;
    
    const element = elements.find(el => el.id === selectedElement);
    if (!element) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - canvasRect.left - dragOffset.x;
    const newY = e.clientY - canvasRect.top - dragOffset.y;
    
    // Ensure element stays within canvas bounds
    const boundedX = Math.max(0, Math.min(newX, canvasRect.width - element.style.width));
    const boundedY = Math.max(0, Math.min(newY, canvasRect.height - element.style.height));
    
    onUpdateElement(selectedElement, {
      style: { ...element.style, x: boundedX, y: boundedY }
    });
  };
  
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onChange();
    }
  };
  
  // Handle canvas click (deselect)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };
  
  return (
    <div className="relative w-full h-full overflow-auto bg-white shadow-inner flex items-center justify-center">
      <div 
        ref={canvasRef}
        className="absolute w-[21cm] h-[29.7cm] bg-white border border-gray-200 shadow-md"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {elements.map(element => (
          <div
            key={element.id}
            className={`absolute cursor-move ${selectedElement === element.id ? 'outline outline-2 outline-blue-500' : ''}`}
            style={{
              left: `${element.style.x}px`,
              top: `${element.style.y}px`,
              width: `${element.style.width}px`,
              height: `${element.style.height}px`,
              fontSize: element.style.fontSize ? `${element.style.fontSize}px` : undefined,
              fontFamily: element.style.fontFamily,
              color: element.style.color,
              backgroundColor: element.style.backgroundColor,
              borderWidth: element.style.borderWidth,
              borderStyle: element.style.borderStyle,
              borderColor: element.style.borderColor,
              padding: element.style.padding ? `${element.style.padding}px` : undefined,
              textAlign: element.style.alignment,
              opacity: element.style.opacity,
              userSelect: 'none',
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            {element.type === 'placeholder' ? (
              <div className="bg-blue-100 text-blue-800 border border-blue-300 px-1 rounded">
                {`{{${element.content}}}`}
              </div>
            ) : element.type === 'heading' ? (
              <h2 className="font-bold">{element.content}</h2>
            ) : element.type === 'image' ? (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                {element.content ? (
                  <img src={element.content} alt="Template element" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span className="text-gray-400">Image</span>
                )}
              </div>
            ) : element.type === 'signature' ? (
              <div className="w-full h-full border border-dashed border-gray-400 flex items-center justify-center">
                <span className="text-gray-400">Signature Area</span>
              </div>
            ) : element.type === 'divider' ? (
              <hr className="w-full border-t border-gray-300" />
            ) : (
              <div>{element.content}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
