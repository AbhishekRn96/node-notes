import { useState, useEffect } from 'react';
import { Note, Node, Folder } from '@/types/notes';
import { notesStorage, DEFAULT_FOLDER_ID } from '@/lib/storage';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(DEFAULT_FOLDER_ID);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const data = notesStorage.getData();
    setNotes(data.notes);
    setFolders(data.folders);
    if (data.notes.length > 0) {
      setSelectedNoteId(data.notes[0].id);
      setSelectedFolderId(data.notes[0].folderId);
    }

    // Auto-close sidebar on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createNote = (folderId: string) => {
    const defaultNode: Node = {
      id: Date.now().toString(),
      type: 'text',
      content: ''
    };

    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      nodes: [defaultNode],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      folderId: folderId,
      tags: []
    };

    notesStorage.addNote(newNote);
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
    setSelectedFolderId(folderId);
  };

  const updateNote = (updatedNote: Note) => {
    notesStorage.updateNote(updatedNote.id, updatedNote);
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const deleteNote = (noteId: string) => {
    notesStorage.deleteNote(noteId);
    const newNotes = notes.filter(n => n.id !== noteId);
    setNotes(newNotes);
    
    // Clear selection if the deleted note was selected
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const createFolder = (parentId: string | null) => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: 'New Folder',
      parentId: parentId,
      createdAt: Date.now()
    };
    notesStorage.addFolder(newFolder);
    setFolders([...folders, newFolder]);
  };

  const deleteFolder = (folderId: string) => {
    // Check if the currently selected note is in the folder being deleted
    const selectedNote = notes.find(n => n.id === selectedNoteId);
    const isSelectedNoteInFolder = selectedNote?.folderId === folderId;
    
    notesStorage.deleteFolder(folderId);
    const data = notesStorage.getData();
    setFolders(data.folders);
    setNotes(data.notes);
    
    // Clear selection if the note was in the deleted folder
    if (isSelectedNoteInFolder) {
      setSelectedNoteId(null);
    }
  };

  const renameFolder = (folderId: string, newName: string) => {
    notesStorage.updateFolder(folderId, { name: newName });
    setFolders(folders.map(f => f.id === folderId ? { ...f, name: newName } : f));
  };

  const updateFolderColor = (folderId: string, color: string) => {
    notesStorage.updateFolder(folderId, { color });
    setFolders(folders.map(f => f.id === folderId ? { ...f, color } : f));
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar
        notes={notes}
        folders={folders}
        selectedNoteId={selectedNoteId}
        selectedFolderId={selectedFolderId}
        onSelectNote={(noteId) => {
          setSelectedNoteId(noteId);
          // Auto-close sidebar on mobile after selecting note
          if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
          }
        }}
        onSelectFolder={setSelectedFolderId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        onRenameFolder={renameFolder}
        onUpdateFolderColor={updateFolderColor}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <NoteEditor
        note={selectedNote}
        folders={folders}
        onUpdateNote={updateNote}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}