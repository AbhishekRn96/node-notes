import { useState } from 'react';
import { ChecklistNode, ChecklistItem } from '@/types/notes';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, GripVertical } from 'lucide-react';

interface ChecklistNodeEditorProps {
  node: ChecklistNode;
  onChange: (items: ChecklistItem[]) => void;
  viewMode: 'view' | 'edit';
}

export default function ChecklistNodeEditor({ node, onChange, viewMode }: ChecklistNodeEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    const newItems = node.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange(newItems);
  };

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: '',
      checked: false
    };
    onChange([...node.items, newItem]);
  };

  const removeItem = (id: string) => {
    onChange(node.items.filter(item => item.id !== id));
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

  // View mode: clean checklist display
  if (viewMode === 'view') {
    return (
      <div className="space-y-2">
        {node.items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Checkbox
              checked={item.checked}
              onCheckedChange={(checked) => updateItem(item.id, { checked: !!checked })}
            />
            <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
              {item.text || 'Empty item'}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Edit mode: full editor with controls
  return (
    <div className="bg-white rounded-lg p-3 space-y-2">
      {node.items.map((item, index) => (
        <div
          key={item.id}
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
          <Checkbox
            checked={item.checked}
            onCheckedChange={(checked) => updateItem(item.id, { checked: !!checked })}
          />
          <Input
            value={item.text}
            onChange={(e) => updateItem(item.id, { text: e.target.value })}
            placeholder="Add item..."
            className={`flex-1 ${item.checked ? 'line-through text-muted-foreground' : ''}`}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeItem(item.id)}
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