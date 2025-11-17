import { useRef } from 'react';
import { ImageNode } from '@/types/notes';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface ImageNodeEditorProps {
  node: ImageNode;
  onChange: (imageData: string, alt: string) => void;
  onClear: () => void;
  viewMode: 'view' | 'edit';
}

export default function ImageNodeEditor({ node, onChange, onClear, viewMode }: ImageNodeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result as string, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // View mode: clean image display
  if (viewMode === 'view') {
    if (!node.imageData) {
      return <div className="text-muted-foreground text-sm">No image</div>;
    }
    return (
      <div className="rounded-lg overflow-hidden">
        <img src={node.imageData} alt={node.alt || 'Image'} className="w-full h-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {!node.imageData ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        </div>
      ) : (
        <div className="relative group">
          <img
            src={node.imageData}
            alt={node.alt}
            className="w-full rounded-lg"
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={onClear}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}