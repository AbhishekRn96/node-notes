import { useState } from 'react';
import { ListNode } from '@/types/notes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, GripVertical } from 'lucide-react';

interface ListNodeEditorProps {
  node: ListNode;
  onChange: (items: string[]) => void;
  viewMode: 'view' | 'edit';
}

export default function ListNodeEditor({ node, onChange, viewMode }: ListNodeEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateItem = (index: number, value: string) => {
    const newItems = [...node.items];
    newItems[index] = value;
    onChange(newItems);
  };

  const addItem = () => {
    onChange([...node.items, '']);
  };

  const removeItem = (index: number) => {
    onChange(node.items.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...node.items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    onChange(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // View mode: clean list display
  if (viewMode === 'view') {
    return (
      <div className="space-y-1">
        {node.type === 'ordered-list' ? (
          <ol className="list-decimal list-inside space-y-1">
            {node.items.map((item, index) => (
              <li key={index}>{item || 'Empty item'}</li>
            ))}
          </ol>
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {node.items.map((item, index) => (
              <li key={index}>{item || 'Empty item'}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Edit mode: full editor with controls
  return (
    <div className="bg-white rounded-lg p-3 space-y-2">
      {node.items.map((item, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(index, e)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 group transition-all duration-200 ${
            draggedIndex === index ? 'opacity-40 scale-95' : ''
          } ${
            dragOverIndex === index && draggedIndex !== index
              ? 'transform translate-y-1'
              : ''
          }`}
        >
          <div className="cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-muted-foreground min-w-[24px]">
            {node.type === 'ordered-list' ? `${index + 1}.` : '•'}
          </span>
          <Input
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder="List item..."
            className="flex-1"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(index)}
            className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );
}