import { useState, useRef, useEffect } from 'react';
import { TextNode } from '@/types/notes';
import { Bold, Italic, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextNodeEditorProps {
  node: TextNode;
  onChange: (content: string) => void;
}

export default function TextNodeEditor({ node, onChange }: TextNodeEditorProps) {
  const [content, setContent] = useState(node.content);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormat('createLink', url);
    }
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex gap-1 mb-2 pb-2 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applyFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[60px] p-3 outline-none focus:ring-2 focus:ring-primary/20 rounded"
        suppressContentEditableWarning
      />
    </div>
  );
}
