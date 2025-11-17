import { Node } from '@/types/notes';
import { Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TextNodeEditor from './TextNodeEditor';
import ChecklistNodeEditor from './ChecklistNodeEditor';
import TableNodeEditor from './TableNodeEditor';
import ListNodeEditor from './ListNodeEditor';
import FileNodeEditor from './FileNodeEditor';
import ImageNodeEditor from './ImageNodeEditor';
import AudioNodeEditor from './AudioNodeEditor';
import CanvasNodeEditor from './CanvasNodeEditor';

interface NodeWrapperProps {
  node: Node;
  onUpdate: (node: Node) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  viewMode: 'view' | 'edit';
}

export default function NodeWrapper({
  node,
  onUpdate,
  onDelete,
  onDuplicate,
  viewMode
}: NodeWrapperProps) {
  const renderNodeEditor = () => {
    switch (node.type) {
      case 'text':
        return (
          <TextNodeEditor
            node={node}
            onChange={(content) => onUpdate({ ...node, content })}
            viewMode={viewMode}
          />
        );
      case 'checklist':
        return (
          <ChecklistNodeEditor
            node={node}
            onChange={(items) => onUpdate({ ...node, items })}
            viewMode={viewMode}
          />
        );
      case 'table':
        return (
          <TableNodeEditor
            node={node}
            onChange={(data, rows, cols) => onUpdate({ ...node, data, rows, cols })}
            viewMode={viewMode}
          />
        );
      case 'ordered-list':
      case 'unordered-list':
        return (
          <ListNodeEditor
            node={node}
            onChange={(items) => onUpdate({ ...node, items })}
            viewMode={viewMode}
          />
        );
      case 'file':
        return (
          <FileNodeEditor
            node={node}
            onChange={(fileName, fileData, fileType) =>
              onUpdate({ ...node, fileName, fileData, fileType })
            }
            onClear={() => onUpdate({ ...node, fileName: '', fileData: '', fileType: '' })}
            viewMode={viewMode}
          />
        );
      case 'image':
        return (
          <ImageNodeEditor
            node={node}
            onChange={(imageData, alt) => onUpdate({ ...node, imageData, alt })}
            onClear={() => onUpdate({ ...node, imageData: '', alt: '' })}
            viewMode={viewMode}
          />
        );
      case 'audio':
        return (
          <AudioNodeEditor
            node={node}
            onChange={(audioData, duration) => onUpdate({ ...node, audioData, duration })}
            viewMode={viewMode}
          />
        );
      case 'canvas':
        return (
          <CanvasNodeEditor
            node={node}
            onChange={(canvasData) => onUpdate({ ...node, canvasData })}
            viewMode={viewMode}
          />
        );
      default:
        return null;
    }
  };

  // View mode: seamless rendering without borders or controls
  if (viewMode === 'view') {
    return (
      <div className="mb-4">
        {renderNodeEditor()}
      </div>
    );
  }

  // Edit mode: full controls and borders
  return (
    <div className="group relative border border-border rounded-lg p-4 mb-3 bg-white hover:border-primary/50 transition-all duration-200 cursor-move">
      <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background rounded-lg shadow-md p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="h-7 w-7 p-0"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {renderNodeEditor()}
    </div>
  );
}