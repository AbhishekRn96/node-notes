import { ChecklistNode, ChecklistItem } from '@/types/notes';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ChecklistNodeEditorProps {
  node: ChecklistNode;
  onChange: (items: ChecklistItem[]) => void;
  viewMode: 'view' | 'edit';
}

export default function ChecklistNodeEditor({ node, onChange, viewMode }: ChecklistNodeEditorProps) {
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
      {node.items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
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