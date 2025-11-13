import { Note, Folder, AppData } from '@/types/notes';

const STORAGE_KEY = 'notes-app-data';
const DEFAULT_FOLDER_ID = 'default-folder';

const getDefaultFolder = (): Folder => ({
  id: DEFAULT_FOLDER_ID,
  name: 'Notes',
  parentId: null,
  createdAt: Date.now()
});

export const notesStorage = {
  getData: (): AppData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const defaultData: AppData = {
          notes: [],
          folders: [getDefaultFolder()]
        };
        return defaultData;
      }
      const parsed = JSON.parse(data);
      // Migration: if old format, convert to new format
      if (Array.isArray(parsed)) {
        return {
          notes: parsed.map((note: any) => ({
            ...note,
            folderId: note.folderId || DEFAULT_FOLDER_ID,
            tags: note.tags || []
          })),
          folders: [getDefaultFolder()]
        };
      }
      return parsed;
    } catch (error) {
      console.error('Error loading data:', error);
      return { notes: [], folders: [getDefaultFolder()] };
    }
  },

  saveData: (data: AppData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  getNotes: (): Note[] => {
    return notesStorage.getData().notes;
  },

  saveNotes: (notes: Note[]): void => {
    const data = notesStorage.getData();
    data.notes = notes;
    notesStorage.saveData(data);
  },

  addNote: (note: Note): void => {
    const data = notesStorage.getData();
    data.notes.unshift(note);
    notesStorage.saveData(data);
  },

  updateNote: (noteId: string, updatedNote: Partial<Note>): void => {
    const data = notesStorage.getData();
    const index = data.notes.findIndex(n => n.id === noteId);
    if (index !== -1) {
      data.notes[index] = { ...data.notes[index], ...updatedNote, updatedAt: Date.now() };
      notesStorage.saveData(data);
    }
  },

  deleteNote: (noteId: string): void => {
    const data = notesStorage.getData();
    data.notes = data.notes.filter(n => n.id !== noteId);
    notesStorage.saveData(data);
  },

  // Folder operations
  getFolders: (): Folder[] => {
    return notesStorage.getData().folders;
  },

  addFolder: (folder: Folder): void => {
    const data = notesStorage.getData();
    data.folders.push(folder);
    notesStorage.saveData(data);
  },

  updateFolder: (folderId: string, updates: Partial<Folder>): void => {
    const data = notesStorage.getData();
    const index = data.folders.findIndex(f => f.id === folderId);
    if (index !== -1) {
      data.folders[index] = { ...data.folders[index], ...updates };
      notesStorage.saveData(data);
    }
  },

  deleteFolder: (folderId: string): void => {
    const data = notesStorage.getData();
    // Move notes from deleted folder to default folder
    data.notes = data.notes.map(note => 
      note.folderId === folderId ? { ...note, folderId: DEFAULT_FOLDER_ID } : note
    );
    // Delete folder and its subfolders
    const foldersToDelete = new Set([folderId]);
    let changed = true;
    while (changed) {
      changed = false;
      data.folders.forEach(f => {
        if (f.parentId && foldersToDelete.has(f.parentId) && !foldersToDelete.has(f.id)) {
          foldersToDelete.add(f.id);
          changed = true;
        }
      });
    }
    data.folders = data.folders.filter(f => !foldersToDelete.has(f.id));
    notesStorage.saveData(data);
  }
};

export { DEFAULT_FOLDER_ID };