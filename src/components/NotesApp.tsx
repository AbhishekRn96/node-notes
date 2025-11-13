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
    if (selectedNoteId === noteId) {
      setSelectedNoteId(newNotes.length > 0 ? newNotes[0].id : null);
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
    notesStorage.deleteFolder(folderId);
    const data = notesStorage.getData();
    setFolders(data.folders);
    setNotes(data.notes);
  };

  const renameFolder = (folderId: string, newName: string) => {
    notesStorage.updateFolder(folderId, { name: newName });
    setFolders(folders.map(f => f.id === folderId ? { ...f, name: newName } : f));
  };

  const selectedNote = notes.find(n => n.id === selectedNoteId) || null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        notes={notes}
        folders={folders}
        selectedNoteId={selectedNoteId}
        selectedFolderId={selectedFolderId}
        onSelectNote={setSelectedNoteId}
        onSelectFolder={setSelectedFolderId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onCreateFolder={createFolder}
        onDeleteFolder={deleteFolder}
        onRenameFolder={renameFolder}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <NoteEditor
        note={selectedNote}
        onUpdateNote={updateNote}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}