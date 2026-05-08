import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type FurnitureType = 'chair' | 'table' | 'armchair' | 'sofa' | 'bed' | 'plant' | 'lamp' | 'tv_stand' | 'cabinet' | 'tv' | 'desk' | 'office_chair' | 'carpet' | 'bookshelf';
export type WindowType = 'normal' | 'panoramic';

export interface BaseItem {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface Furniture extends BaseItem {
  type: FurnitureType;
  color: string;
}

export interface WindowItem extends BaseItem {
  wallIndex: number;
  type: WindowType;
}

export interface Wall {
  color: string;
  texture?: string;
  visible: boolean;
}

export interface SavedProject {
  id: string;
  name: string;
  data: string; // JSON stringified state
}

interface RoomState {
  width: number;
  length: number;
  height: number;
  setDimensions: (width: number, length: number, height: number) => void;

  floorColor: string;
  floorTexture: string | null;
  setFloorColor: (color: string) => void;
  setFloorTexture: (texture: string | null) => void;

  walls: Wall[];
  updateWall: (index: number, updates: Partial<Wall>) => void;

  furniture: Furniture[];
  addFurniture: (type: FurnitureType) => void;
  updateFurniture: (id: string, updates: Partial<Furniture>) => void;
  removeFurniture: (id: string) => void;

  windows: WindowItem[];
  addWindow: (wallIndex: number, type: WindowType) => void;
  updateWindow: (id: string, updates: Partial<WindowItem>) => void;
  removeWindow: (id: string) => void;

  selectedId: string | null;
  selectedType: 'furniture' | 'wall' | 'window' | 'floor' | null;
  setSelection: (id: string | null, type: 'furniture' | 'wall' | 'window' | 'floor' | null) => void;

  clearProject: () => void;
  loadProject: (state: any) => void;

  savedProjects: SavedProject[];
  saveCurrentProject: (name: string) => void;
  loadSavedProject: (id: string) => void;
  deleteSavedProject: (id: string) => void;
}

const defaultWalls: Wall[] = [
  { color: '#e5e7eb', visible: true }, // 0: North
  { color: '#e5e7eb', visible: true }, // 1: East
  { color: '#e5e7eb', visible: true }, // 2: South
  { color: '#e5e7eb', visible: true }, // 3: West
];

const loadLocalProjects = (): SavedProject[] => {
  try {
    const data = localStorage.getItem('room_projects');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveLocalProjects = (projects: SavedProject[]) => {
  try {
    localStorage.setItem('room_projects', JSON.stringify(projects));
  } catch {}
};

export const useStore = create<RoomState>((set, get) => ({
  width: 6,
  length: 6,
  height: 3,
  setDimensions: (width, length, height) => set({ width, length, height }),

  floorColor: '#e5e7eb',
  floorTexture: '',
  setFloorColor: (color) => set({ floorColor: color }),
  setFloorTexture: (texture) => set({ floorTexture: texture }),

  walls: [...defaultWalls],
  updateWall: (index, updates) => set((state) => {
    const walls = [...state.walls];
    walls[index] = { ...walls[index], ...updates };
    return { walls };
  }),

  furniture: [],
  addFurniture: (type) => set((state) => {
    const newItem: Furniture = {
      id: uuidv4(),
      type,
      color: '#ffffff',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    return { furniture: [...state.furniture, newItem], selectedId: newItem.id, selectedType: 'furniture' };
  }),
  updateFurniture: (id, updates) => set((state) => ({
    furniture: state.furniture.map((item) => item.id === id ? { ...item, ...updates } : item)
  })),
  removeFurniture: (id) => set((state) => ({
    furniture: state.furniture.filter((item) => item.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
    selectedType: state.selectedId === id ? null : state.selectedType,
  })),

  windows: [],
  addWindow: (wallIndex, type) => set((state) => {
    const newItem: WindowItem = {
      id: uuidv4(),
      wallIndex,
      type,
      position: [0, 0, 0], // Local to wall
      rotation: [0, 0, 0],
      scale: type === 'panoramic' ? [2, 2, 0.2] : [1, 1, 0.2],
    };
    return { windows: [...state.windows, newItem], selectedId: newItem.id, selectedType: 'window' };
  }),
  updateWindow: (id, updates) => set((state) => ({
    windows: state.windows.map((item) => item.id === id ? { ...item, ...updates } : item)
  })),
  removeWindow: (id) => set((state) => ({
    windows: state.windows.filter((item) => item.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
    selectedType: state.selectedId === id ? null : state.selectedType,
  })),

  selectedId: null,
  selectedType: null,
  setSelection: (selectedId, selectedType) => set({ selectedId, selectedType }),

  clearProject: () => set({
    width: 6, length: 6, height: 3,
    floorColor: '#e5e7eb',
    floorTexture: '',
    walls: [...defaultWalls],
    furniture: [], windows: [],
    selectedId: null, selectedType: null
  }),
  
  loadProject: (state) => set({ ...state, selectedId: null, selectedType: null }),

  savedProjects: loadLocalProjects(),
  saveCurrentProject: (name: string) => {
    const state = get();
    const dataToSave = {
      width: state.width,
      length: state.length,
      height: state.height,
      floorColor: state.floorColor,
      floorTexture: state.floorTexture,
      walls: state.walls,
      furniture: state.furniture,
      windows: state.windows,
    };
    const newProject: SavedProject = {
      id: uuidv4(),
      name,
      data: JSON.stringify(dataToSave)
    };
    const updatedProjects = [...state.savedProjects, newProject];
    set({ savedProjects: updatedProjects });
    saveLocalProjects(updatedProjects);
  },
  loadSavedProject: (id: string) => {
    const state = get();
    const proj = state.savedProjects.find(p => p.id === id);
    if (proj) {
      try {
        const parsed = JSON.parse(proj.data);
        set({
          width: parsed.width,
          length: parsed.length,
          height: parsed.height,
          floorColor: parsed.floorColor || '#e5e7eb',
          floorTexture: parsed.floorTexture !== undefined ? parsed.floorTexture : '',
          walls: parsed.walls,
          furniture: parsed.furniture,
          windows: parsed.windows,
          selectedId: null,
          selectedType: null,
        });
      } catch (e) {
        console.error("Failed to load project", e);
      }
    }
  },
  deleteSavedProject: (id: string) => {
    const state = get();
    const updated = state.savedProjects.filter(p => p.id !== id);
    set({ savedProjects: updated });
    saveLocalProjects(updated);
  }
}));
