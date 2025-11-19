import { useState, useEffect, useRef } from "react";
import { Note, Node, NodeType, Folder } from "@/types/notes";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NodeWrapper from "./nodes/NodeWrapper";
import NodeTypeSelector from "./NodeTypeSelector";
import {
  FileText,
  X,
  Tag,
  PanelLeft,
  ChevronRight,
  Folder as FolderIcon,
  Eye,
  Edit3,
  Mic,
  MicOff,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface NoteEditorProps {
  note: Note | null;
  folders: Folder[];
  onUpdateNote: (note: Note) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

type ViewMode = "view" | "edit";

export default function NoteEditor({
  note,
  folders,
  onUpdateNote,
  onToggleSidebar,
  isSidebarOpen,
}: NoteEditorProps) {
  const [localNote, setLocalNote] = useState<Note | null>(note);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [isRecording, setIsRecording] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  // Build breadcrumb path
  const getBreadcrumbs = (folderId: string): Folder[] => {
    const breadcrumbs: Folder[] = [];
    let currentFolder = folders.find((f) => f.id === folderId);

    while (currentFolder) {
      breadcrumbs.unshift(currentFolder);
      if (currentFolder.parentId) {
        currentFolder = folders.find((f) => f.id === currentFolder!.parentId);
      } else {
        break;
      }
    }

    return breadcrumbs;
  };

  if (!localNote) {
    return (
      <div className="flex-1 flex flex-col bg-background w-full">
        <div className="border-b p-3 md:p-6">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="gap-2 h-8 md:h-9"
              >
                <PanelLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Show Sidebar</span>
              </Button>
            )}
            <div className="flex-1" />
          </div>
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

  const handleDragStart = (index: number, e: React.DragEvent) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;

    const newNodes = [...localNote.nodes];
    const draggedNode = newNodes[draggedIndex];
    newNodes.splice(draggedIndex, 1);
    newNodes.splice(index, 0, draggedNode);

    const updated = { ...localNote, nodes: newNodes };
    setLocalNote(updated);
    onUpdateNote(updated);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak now to add content to your note",
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      // Using Web Speech API for browser-based transcription
      const recognition = new (window as any).webkitSpeechRecognition() || new (window as any).SpeechRecognition();
      
      toast({
        title: "Transcribing...",
        description: "Converting speech to text",
      });

      // For demo purposes, we'll simulate transcription
      // In production, you'd send audioBlob to an AI service like OpenAI Whisper
      setTimeout(() => {
        const transcribedText = "This is a simulated transcription. In production, integrate with OpenAI Whisper API or similar service.";
        
        // Add transcribed text as a new text node
        const newNode = createNode("text");
        (newNode as any).content = transcribedText;
        const newNodes = [...localNote!.nodes, newNode];
        const updated = { ...localNote!, nodes: newNodes };
        setLocalNote(updated);
        onUpdateNote(updated);

        toast({
          title: "Transcription complete",
          description: "Speech has been added to your note",
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Could not transcribe audio. Please try again.",
        variant: "destructive",
      });
    }
  };

  const summarizeNote = async () => {
    if (!localNote || localNote.nodes.length === 0) {
      toast({
        title: "Nothing to summarize",
        description: "Add some content to your note first",
        variant: "destructive",
      });
      return;
    }

    setIsSummarizing(true);
    
    try {
      // Extract all text content from nodes
      const noteContent = localNote.nodes
        .map((node) => {
          if (node.type === "text") return (node as any).content;
          if (node.type === "checklist") return (node as any).items.map((item: any) => item.text).join("\n");
          if (node.type === "ordered-list" || node.type === "unordered-list") return (node as any).items.join("\n");
          return "";
        })
        .filter(Boolean)
        .join("\n\n");

      if (!noteContent.trim()) {
        toast({
          title: "No text content",
          description: "Your note doesn't contain any text to summarize",
          variant: "destructive",
        });
        setIsSummarizing(false);
        return;
      }

      // Simulate AI summarization
      // In production, integrate with OpenAI GPT-4 or similar
      setTimeout(() => {
        const summary = `📝 AI Summary:\n\nThis note contains ${localNote.nodes.length} content blocks. Key points have been identified and organized.\n\nIn production, this would be replaced with actual AI-generated summary using OpenAI GPT-4 or similar service.\n\nOriginal content length: ${noteContent.length} characters`;
        
        // Add summary as a new text node at the top
        const summaryNode = createNode("text");
        (summaryNode as any).content = summary;
        const newNodes = [summaryNode, ...localNote.nodes];
        const updated = { ...localNote, nodes: newNodes };
        setLocalNote(updated);
        onUpdateNote(updated);

        toast({
          title: "Summary generated",
          description: "AI summary has been added to the top of your note",
        });
        setIsSummarizing(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Summarization failed",
        description: "Could not generate summary. Please try again.",
        variant: "destructive",
      });
      setIsSummarizing(false);
    }
  };

  const breadcrumbs = localNote ? getBreadcrumbs(localNote.folderId) : [];

  return (
    <div className="flex-1 flex flex-col bg-background w-full">
      {/* Header with sidebar toggle */}
      <div className="border-b p-3 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="gap-2 h-8 md:h-9"
            >
              <PanelLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Show Sidebar</span>
            </Button>
          )}
          <div className="flex-1" />
          
          {/* AI Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={summarizeNote}
              disabled={isSummarizing || !localNote || localNote.nodes.length === 0}
              className="gap-2 h-8 md:h-9"
            >
              {isSummarizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span className="hidden md:inline">AI Summary</span>
            </Button>
            
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className="gap-2 h-8 md:h-9"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span className="hidden md:inline">Stop</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span className="hidden md:inline">Record</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Breadcrumbs and View/Edit Toggle in Same Row */}
        <div className="flex items-center justify-between mb-2 md:mb-3 gap-2 flex-wrap">
          {breadcrumbs.length > 0 ? (
            <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground px-1 md:px-2 overflow-x-auto max-w-[60%] md:max-w-none">
              {breadcrumbs.map((folder, index) => (
                <div
                  key={folder.id}
                  className="flex items-center gap-1 flex-shrink-0"
                >
                  <FolderIcon
                    className="h-3 w-3"
                    style={{ color: folder.color || undefined }}
                  />
                  <span className="truncate max-w-[80px] md:max-w-none">
                    {folder.name}
                  </span>
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div />
          )}

          {/* View/Edit Mode Toggle */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant={viewMode === "view" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("view")}
              className="gap-1 md:gap-2 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button
              variant={viewMode === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("edit")}
              className="gap-1 md:gap-2 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3 bg-violet-600 text-[#fff]"
            >
              <Edit3 className="h-3 w-3" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>
        </div>

        <Input
          value={localNote.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Untitled Note"
          className="text-xl md:text-2xl font-semibold border-0 focus-visible:ring-0 mb-2 md:mb-3 py-[6px] md:py-[8px] px-[6px] md:px-[8px]"
          readOnly={viewMode === "view"}
        />

        {/* Tags Section */}
        <div className="flex flex-wrap gap-1 md:gap-2 items-center">
          {localNote.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
              <Tag className="h-3 w-3" />
              {tag}
              {viewMode === "edit" && (
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-accent rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {viewMode === "edit" && (
            <>
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
                  className="h-6 md:h-7 w-24 md:w-32 text-xs md:text-sm"
                  autoFocus
                />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTagInput(true)}
                  className="h-6 md:h-7 px-1 md:px-2 text-xs"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  Add Tag
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 pb-20 md:pb-24">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          {localNote.nodes.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                {viewMode === "edit"
                  ? "Click a node type in the toolbar below to start adding content"
                  : "This note is empty"}
              </p>
            </div>
          ) : (
            <>
              {localNote.nodes.map((node, index) => (
                <div
                  key={node.id}
                  draggable={viewMode === "edit"}
                  onDragStart={(e) =>
                    viewMode === "edit" && handleDragStart(index, e)
                  }
                  onDragOver={(e) =>
                    viewMode === "edit" && handleDragOver(e, index)
                  }
                  onDrop={(e) => viewMode === "edit" && handleDrop(e, index)}
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
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
      {/* Bottom Toolbar - Only show in edit mode */}
      {viewMode === "edit" && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center p-2 md:p-4">
          <div className="bg-muted/50 backdrop-blur-md rounded-full shadow-2xl border px-3 md:px-6 py-2 md:py-3 max-w-fit overflow-x-auto">
            <NodeTypeSelector onSelect={addNode} />
          </div>
        </div>
      )}
    </div>
  );
}