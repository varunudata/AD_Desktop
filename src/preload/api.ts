import { ipcRenderer } from 'electron';
import { ClassFlowAPI } from '../shared/types/api';

export const classflowAPI: ClassFlowAPI = {
  classrooms: {
    list: (filters) => ipcRenderer.invoke('classrooms:list', filters),
    getById: (id) => ipcRenderer.invoke('classrooms:getById', id),
    create: (input) => ipcRenderer.invoke('classrooms:create', input),
    update: (id, input) => ipcRenderer.invoke('classrooms:update', { id, input }),
    delete: (id) => ipcRenderer.invoke('classrooms:delete', id),
  },

  faculty: {
    list: (filters) => ipcRenderer.invoke('faculty:list', filters),
    getById: (id) => ipcRenderer.invoke('faculty:getById', id),
    create: (input) => ipcRenderer.invoke('faculty:create', input),
    update: (id, input) => ipcRenderer.invoke('faculty:update', { id, input }),
    delete: (id) => ipcRenderer.invoke('faculty:delete', id),
  },

  subjects: {
    list: (filters) => ipcRenderer.invoke('subjects:list', filters),
    getById: (id) => ipcRenderer.invoke('subjects:getById', id),
    create: (input) => ipcRenderer.invoke('subjects:create', input),
    update: (id, input) => ipcRenderer.invoke('subjects:update', { id, input }),
    delete: (id) => ipcRenderer.invoke('subjects:delete', id),
  },

  schedules: {
    list: (filters) => ipcRenderer.invoke('schedules:list', filters),
    getById: (id) => ipcRenderer.invoke('schedules:getById', id),
    create: (input) => ipcRenderer.invoke('schedules:create', input),
    update: (id, input) => ipcRenderer.invoke('schedules:update', { id, input }),
    delete: (id) => ipcRenderer.invoke('schedules:delete', id),
  },

  dashboard: {
    getSummary: () => ipcRenderer.invoke('dashboard:getSummary'),
  },

  reports: {
    getRoomUtilization: (filters) => ipcRenderer.invoke('reports:getRoomUtilization', filters),
    exportCsv: (options) => ipcRenderer.invoke('reports:exportCsv', options),
  },

  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (input) => ipcRenderer.invoke('settings:update', input),
  },

  database: {
    checkHealth: () => ipcRenderer.invoke('database:checkHealth'),
    seedDemoData: () => ipcRenderer.invoke('database:seedDemoData'),
    clearWorkspace: () => ipcRenderer.invoke('database:clearWorkspace'),
  },
};
