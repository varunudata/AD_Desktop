import { contextBridge } from 'electron';
import { classflowAPI } from './api';

// Expose safe, typed API to renderer window
try {
  contextBridge.exposeInMainWorld('classflowAPI', classflowAPI);
  console.log('[ClassFlow Preload] Successfully exposed classflowAPI to window.');
} catch (err) {
  console.error('[ClassFlow Preload] Failed to expose classflowAPI:', err);
}
