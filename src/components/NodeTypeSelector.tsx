import { NodeType } from '@/types/notes';
import { Button } from '@/components/ui/button';
import {
  Type,
  CheckSquare,
  Table,
  List,
  ListOrdered,
  FileText,
  Image,
  Mic,
  Palette
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NodeTypeSelectorProps {
  onSelect: (type: NodeType) => void;
}

const nodeTypes: { type: NodeType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Rich Text', icon: <Type className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'checklist', label: 'Checklist', icon: <CheckSquare className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'table', label: 'Table', icon: <Table className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'ordered-list', label: 'Numbered List', icon: <ListOrdered className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'unordered-list', label: 'Bullet List', icon: <List className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'file', label: 'File Attachment', icon: <FileText className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'image', label: 'Image', icon: <Image className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'audio', label: 'Audio', icon: <Mic className="h-4 w-4 md:h-5 md:w-5" /> },
  { type: 'canvas', label: 'Canvas', icon: <Palette className="h-4 w-4 md:h-5 md:w-5" /> },
];

export default function NodeTypeSelector({ onSelect }: NodeTypeSelectorProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-row gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
        {nodeTypes.map(({ type, label, icon }) => (
          <Tooltip key={type}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(type)}
                className="h-8 w-8 md:h-10 md:w-10 p-0 hover:bg-primary/10 flex-shrink-0"
              >
                {icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs md:text-sm">{label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}