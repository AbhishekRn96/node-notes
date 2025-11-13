import { ListNode } from '@/types/notes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface ListNodeEditorProps {
  node: ListNode;
  onChange: (items: string[]) => void;
}

export default function ListNodeEditor({ node, onChange }: ListNodeEditorProps) {
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

  return (
    <div className="bg-white rounded-lg p-3 space-y-2">
      {node.items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 group">
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
