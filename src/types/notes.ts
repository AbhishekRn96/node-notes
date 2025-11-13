export type NodeType = 
  | 'text' 
  | 'checklist' 
  | 'table' 
  | 'ordered-list' 
  | 'unordered-list' 
  | 'file' 
  | 'image' 
  | 'audio' 
  | 'canvas';

export interface BaseNode {
  id: string;
  type: NodeType;
}

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistNode extends BaseNode {
  type: 'checklist';
  items: ChecklistItem[];
}

export interface TableNode extends BaseNode {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
}

export interface ListNode extends BaseNode {
  type: 'ordered-list' | 'unordered-list';
  items: string[];
}

export interface FileNode extends BaseNode {
  type: 'file';
  fileName: string;
  fileData: string;
  fileType: string;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  imageData: string;
  alt: string;
}

export interface AudioNode extends BaseNode {
  type: 'audio';
  audioData: string;
  duration?: number;
}

export interface CanvasNode extends BaseNode {
  type: 'canvas';
  canvasData: string;
}

export type Node = 
  | TextNode 
  | ChecklistNode 
  | TableNode 
  | ListNode 
  | FileNode 
  | ImageNode 
  | AudioNode 
  | CanvasNode;

export interface Note {
  id: string;
  title: string;
  nodes: Node[];
  createdAt: number;
  updatedAt: number;
  folderId: string;
  tags: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
  color?: string;
}

export interface AppData {
  notes: Note[];
  folders: Folder[];
}