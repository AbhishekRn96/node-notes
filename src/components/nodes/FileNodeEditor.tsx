import { useRef } from 'react';
import { FileNode } from '@/types/notes';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X } from 'lucide-react';

interface FileNodeEditorProps {
  node: FileNode;
  onChange: (fileName: string, fileData: string, fileType: string) => void;
  onClear: () => void;
  viewMode: 'view' | 'edit';
}

export default function FileNodeEditor({ node, onChange, onClear, viewMode }: FileNodeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(file.name, reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  // View mode: simple file display
  if (viewMode === 'view') {
    if (!node.fileName) {
      return <div className="text-muted-foreground text-sm">No file attached</div>;
    }
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <FileIcon className="h-5 w-5" />
        <span className="text-sm font-medium">{node.fileName}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {!node.fileName ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
          <FileText className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">{node.fileName}</p>
            <p className="text-sm text-muted-foreground">{node.fileType}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}