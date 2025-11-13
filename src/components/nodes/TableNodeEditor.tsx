import { TableNode } from '@/types/notes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface TableNodeEditorProps {
  node: TableNode;
  onChange: (data: string[][], rows: number, cols: number) => void;
}

export default function TableNodeEditor({ node, onChange }: TableNodeEditorProps) {
  const updateCell = (row: number, col: number, value: string) => {
    const newData = node.data.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? value : c)) : r
    );
    onChange(newData, node.rows, node.cols);
  };

  const addRow = () => {
    const newRow = Array(node.cols).fill('');
    onChange([...node.data, newRow], node.rows + 1, node.cols);
  };

  const addColumn = () => {
    const newData = node.data.map(row => [...row, '']);
    onChange(newData, node.rows, node.cols + 1);
  };

  const removeRow = () => {
    if (node.rows > 1) {
      onChange(node.data.slice(0, -1), node.rows - 1, node.cols);
    }
  };

  const removeColumn = () => {
    if (node.cols > 1) {
      const newData = node.data.map(row => row.slice(0, -1));
      onChange(newData, node.rows, node.cols - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg p-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {node.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border p-1">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="border-0 focus-visible:ring-0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" />
          Row
        </Button>
        <Button variant="outline" size="sm" onClick={addColumn}>
          <Plus className="h-4 w-4 mr-1" />
          Column
        </Button>
        <Button variant="outline" size="sm" onClick={removeRow} disabled={node.rows <= 1}>
          <Minus className="h-4 w-4 mr-1" />
          Row
        </Button>
        <Button variant="outline" size="sm" onClick={removeColumn} disabled={node.cols <= 1}>
          <Minus className="h-4 w-4 mr-1" />
          Column
        </Button>
      </div>
    </div>
  );
}
