import { useRef, useEffect, useState } from 'react';
import { CanvasNode } from '@/types/notes';
import { Button } from '@/components/ui/button';
import { Eraser, Pen } from 'lucide-react';

interface CanvasNodeEditorProps {
  node: CanvasNode;
  onChange: (canvasData: string) => void;
}

export default function CanvasNodeEditor({ node, onChange }: CanvasNodeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && node.canvasData) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
      img.src = node.canvasData;
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const rect = canvas!.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      const rect = canvas!.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = tool === 'pen' ? '#000' : '#fff';
      ctx.lineWidth = tool === 'pen' ? 2 : 10;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      onChange(canvas.toDataURL());
    }
  };

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex gap-2 mb-3">
        <Button
          variant={tool === 'pen' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('pen')}
        >
          <Pen className="h-4 w-4 mr-2" />
          Pen
        </Button>
        <Button
          variant={tool === 'eraser' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setTool('eraser')}
        >
          <Eraser className="h-4 w-4 mr-2" />
          Eraser
        </Button>
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          Clear
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border rounded-lg cursor-crosshair bg-white w-full"
      />
    </div>
  );
}
