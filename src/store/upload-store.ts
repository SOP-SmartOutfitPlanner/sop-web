import { create } from "zustand";
import type { ApiWardrobeItem } from "@/lib/api/wardrobe-api";

export interface UploadTask {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "analyzing" | "success" | "error";
  retryCount?: number;
  isRetrying?: boolean;
  errorMessage?: string;
  createdItemId?: number;
  createdItemData?: ApiWardrobeItem; // Cache item data to avoid fetch issues
}

interface UploadStore {
  tasks: UploadTask[];
  activeTaskId: string | null;

  // Actions
  addTask: (task: Omit<UploadTask, "id">) => string;
  updateTask: (id: string, updates: Partial<UploadTask>) => void;
  removeTask: (id: string) => void;
  setActiveTask: (id: string | null) => void;
  clearCompletedTasks: () => void;
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  tasks: [],
  activeTaskId: null,

  addTask: (task) => {
    const id = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTask = { ...task, id };

    set((state) => ({
      tasks: [...state.tasks, newTask],
      activeTaskId: id,
    }));

    return id;
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      ),
    }));
  },

  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      activeTaskId: state.activeTaskId === id ? null : state.activeTaskId,
    }));
  },

  setActiveTask: (id) => {
    set({ activeTaskId: id });
  },

  clearCompletedTasks: () => {
    set((state) => ({
      tasks: state.tasks.filter(
        (task) => task.status !== "success" && task.status !== "error"
      ),
    }));
  },
}));
