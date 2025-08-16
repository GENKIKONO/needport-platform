import type { AdminProject } from '../types/admin';
import { seedDemoProjects } from './demo-data';

const STORAGE_KEY = 'admin:demo-projects';

// SSR時はメモリMapで代替
let memStore = new Map<string, string>();

export function loadProjects(): AdminProject[] {
  if (typeof window === 'undefined') {
    // SSR時は初期データを返す
    return seedDemoProjects();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // 初回は初期データを生成して保存
    const initial = seedDemoProjects();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch (error) {
    console.warn('Failed to load projects from localStorage:', error);
    return seedDemoProjects();
  }
}

export function saveProjects(projects: AdminProject[]): void {
  if (typeof window === 'undefined') {
    // SSR時はメモリに保存
    memStore.set(STORAGE_KEY, JSON.stringify(projects));
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.warn('Failed to save projects to localStorage:', error);
  }
}
