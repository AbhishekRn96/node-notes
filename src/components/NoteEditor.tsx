import { useState, useEffect } from "react";
import { Note, Node, NodeType } from "@/types/notes";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NodeWrapper from "./nodes/NodeWrapper";
import NodeTypeSelector from "./NodeTypeSelector";
import { FileText, X, Tag, Menu, PanelLeft } from "lucide-react";

interface NoteEditorProps {
  note: Note | null;
  onUpdateNote: (note: Note) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function NoteEditor({
  note,
  onUpdateNote,
  onToggleSidebar,
  isSidebarOpen,
}: NoteEditorProps) {
  const [localNote, setLocalNote] = useState<Note | null>(note);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  if (!localNote) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        <div className="border-b p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="gap-2"
          >
            <PanelLeft className="h-4 w-4" />
            {isSidebarOpen ? "Hide" : "Show"} Sidebar
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select a note or create a new one</p>
          </div>
        </div>
      </div>
    );
  }

  const updateTitle = (title: string) => {
    const updated = { ...localNote, title };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !localNote.tags.includes(tag)) {
      const updated = { ...localNote, tags: [...localNote.tags, tag] };
      setLocalNote(updated);
      onUpdateNote(updated);
    }
    setTagInput("");
    setShowTagInput(false);
  };

  const removeTag = (tagToRemove: string) => {
    const updated = {
      ...localNote,
      tags: localNote.tags.filter((t) => t !== tagToRemove),
    };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const createNode = (type: NodeType): Node => {
    const baseNode = {
      id: Date.now().toString(),
      type,
    };

    switch (type) {
      case "text":
        return { ...baseNode, type: "text", content: "" };
      case "checklist":
        return {
          ...baseNode,
          type: "checklist",
          items: [{ id: "1", text: "", checked: false }],
        };
      case "table":
        return {
          ...baseNode,
          type: "table",
          rows: 2,
          cols: 2,
          data: [
            ["", ""],
            ["", ""],
          ],
        };
      case "ordered-list":
        return { ...baseNode, type: "ordered-list", items: [""] };
      case "unordered-list":
        return { ...baseNode, type: "unordered-list", items: [""] };
      case "file":
        return {
          ...baseNode,
          type: "file",
          fileName: "",
          fileData: "",
          fileType: "",
        };
      case "image":
        return { ...baseNode, type: "image", imageData: "", alt: "" };
      case "audio":
        return { ...baseNode, type: "audio", audioData: "" };
      case "canvas":
        return { ...baseNode, type: "canvas", canvasData: "" };
      default:
        return { ...baseNode, type: "text", content: "" };
    }
  };

  const addNode = (type: NodeType) => {
    const newNode = createNode(type);
    const newNodes = [...localNote.nodes, newNode];
    const updated = { ...localNote, nodes: newNodes };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const updateNode = (index: number, updatedNode: Node) => {
    const newNodes = [...localNote.nodes];
    newNodes[index] = updatedNode;
    const updated = { ...localNote, nodes: newNodes };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const deleteNode = (index: number) => {
    const newNodes = localNote.nodes.filter((_, i) => i !== index);
    const updated = { ...localNote, nodes: newNodes };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const duplicateNode = (index: number) => {
    const nodeToDuplicate = localNote.nodes[index];
    const newNode = { ...nodeToDuplicate, id: Date.now().toString() };
    const newNodes = [...localNote.nodes];
    newNodes.splice(index + 1, 0, newNode);
    const updated = { ...localNote, nodes: newNodes };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const handleDragStart = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newNodes = [...localNote.nodes];
    const draggedNode = newNodes[draggedIndex];
    newNodes.splice(draggedIndex, 1);
    newNodes.splice(index, 0, draggedNode);

    const updated = { ...localNote, nodes: newNodes };
    setLocalNote(updated);
    onUpdateNote(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header with sidebar toggle */}
      <div className="border-b p-6">
        {!isSidebarOpen && (
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="gap-2"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Input
          value={localNote.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Untitled Note"
          className="text-2xl font-semibold border-0 focus-visible:ring-0 mb-3 py-[8px] px-[8px]"
        />

        {/* Tags Section */}
        <div className="flex flex-wrap gap-2 items-center">
          {localNote.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              <Tag className="h-3 w-3" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-accent rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {showTagInput ? (
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onBlur={addTag}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTag();
                if (e.key === "Escape") {
                  setShowTagInput(false);
                  setTagInput("");
                }
              }}
              placeholder="Add tag..."
              className="h-7 w-32 text-sm"
              autoFocus
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagInput(true)}
              className="h-7 px-2 text-xs"
            >
              <Tag className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 pb-24">
        <div className="max-w-4xl mx-auto p-8">
          {localNote.nodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Click a node type in the toolbar below to start adding content
              </p>
            </div>
          ) : (
            <>
              {localNote.nodes.map((node, index) => (
                <div
                  key={node.id}
                  draggable={draggedIndex === index}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={handleDragEnd}
                  className={`transition-all duration-200 ${
                    draggedIndex === index ? "opacity-40 scale-95" : ""
                  } ${
                    dragOverIndex === index && draggedIndex !== index
                      ? "transform translate-y-2"
                      : ""
                  }`}
                >
                  <NodeWrapper
                    node={node}
                    onUpdate={(updatedNode) => updateNode(index, updatedNode)}
                    onDelete={() => deleteNode(index)}
                    onDuplicate={() => duplicateNode(index)}
                    onDragStart={(e) => handleDragStart(index, e)}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
      {/* Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4">
        <div className="bg-muted/50 backdrop-blur-md rounded-full shadow-2xl border px-6 py-3 max-w-fit">
          <NodeTypeSelector onSelect={addNode} />
        </div>
      </div>
    </div>
  );
}
