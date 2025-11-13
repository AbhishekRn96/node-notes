import { Note, Folder } from "@/types/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  FileText,
  Trash2,
  Folder as FolderIcon,
  FolderPlus,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Tag,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  notes: Note[];
  folders: Folder[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  onSelectNote: (noteId: string) => void;
  onSelectFolder: (folderId: string) => void;
  onCreateNote: (folderId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDeleteFolder: (folderId: string) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  notes,
  folders,
  selectedNoteId,
  selectedFolderId,
  onSelectNote,
  onSelectFolder,
  onCreateNote,
  onDeleteNote,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["default-folder"]),
  );
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const startRename = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingName(folder.name);
  };

  const finishRename = () => {
    if (editingFolderId && editingName.trim()) {
      onRenameFolder(editingFolderId, editingName.trim());
    }
    setEditingFolderId(null);
    setEditingName("");
  };

  const getSubfolders = (parentId: string | null) => {
    return folders.filter((f) => f.parentId === parentId);
  };

  const getFolderNotes = (folderId: string) => {
    return notes.filter((note) => note.folderId === folderId);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderFolder = (folder: Folder, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const subfolders = getSubfolders(folder.id);
    const folderNotes = searchQuery ? [] : getFolderNotes(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent ${
            isSelected ? "bg-accent" : ""
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-0.5 hover:bg-accent-foreground/10 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          <FolderIcon className="h-4 w-4 text-muted-foreground" />
          {isEditing ? (
            <Input
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={finishRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishRename();
                if (e.key === "Escape") setEditingFolderId(null);
              }}
              className="h-6 text-sm flex-1"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-sm truncate"
              onClick={() => onSelectFolder(folder.id)}
            >
              {folder.name}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateNote(folder.id)}>
                <Plus className="h-3 w-3 mr-2" />
                New Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateFolder(folder.id)}>
                <FolderPlus className="h-3 w-3 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startRename(folder)}>
                Rename
              </DropdownMenuItem>
              {folder.id !== "default-folder" && (
                <DropdownMenuItem
                  onClick={() => onDeleteFolder(folder.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExpanded && (
          <>
            {folderNotes.map((note) => (
              <div
                key={note.id}
                className={`group relative px-2 py-2 rounded-md mb-0.5 cursor-pointer transition-colors ${
                  selectedNoteId === note.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                }`}
                style={{ paddingLeft: `${depth * 12 + 32}px` }}
                onClick={() => onSelectNote(note.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">
                      {note.title || "Untitled"}
                    </h3>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs px-1 py-0 h-4"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0 h-4"
                          >
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {subfolders.map((subfolder) => renderFolder(subfolder, depth + 1))}
          </>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`w-72 border-r bg-background h-screen flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Notes</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => onCreateNote(selectedFolderId || "default-folder")}
            className="flex-1 bg-violet-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
          <Button
            onClick={() => onCreateFolder(null)}
            variant="outline"
            size="icon"
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes & tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {searchQuery ? (
            filteredNotes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notes found</p>
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative p-3 rounded-lg mb-1 cursor-pointer transition-colors ${
                    selectedNoteId === note.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => onSelectNote(note.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {note.title || "Untitled"}
                      </h3>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {note.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )
          ) : (
            folders
              .filter((f) => f.parentId === null)
              .map((folder) => renderFolder(folder))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
