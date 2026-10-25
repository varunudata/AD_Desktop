import { ipcMain } from 'electron';
import { classroomService } from '../services/classroomService';
import { facultyService } from '../services/facultyService';
import { subjectService } from '../services/subjectService';
import { scheduleService } from '../services/scheduleService';
import { dashboardService } from '../services/dashboardService';
import { reportService } from '../services/reportService';
import { settingsService } from '../services/settingsService';
import { databaseService } from '../services/databaseService';
import { formatError } from '../utils/errors';
import { IPCResult } from '../../shared/types/ipc';

function handleIPC<TInput, TOutput>(
  channel: string,
  handler: (input: TInput) => Promise<TOutput>
): void {
  ipcMain.handle(channel, async (_event, input: TInput): Promise<IPCResult<TOutput>> => {
    try {
      const data = await handler(input);
      return { success: true, data };
    } catch (err: unknown) {
      console.error(`[IPC Error] ${channel}:`, err);
      return { success: false, error: formatError(err) };
    }
  });
}

export function registerIPCHandlers(): void {
  // Classrooms
  handleIPC('classrooms:list', (filters: any) => classroomService.list(filters));
  handleIPC('classrooms:getById', (id: string) => classroomService.getById(id));
  handleIPC('classrooms:create', (input: any) => classroomService.create(input));
  handleIPC('classrooms:update', ({ id, input }: any) => classroomService.update(id, input));
  handleIPC('classrooms:delete', (id: string) => classroomService.delete(id));

  // Faculty
  handleIPC('faculty:list', (filters: any) => facultyService.list(filters));
  handleIPC('faculty:getById', (id: string) => facultyService.getById(id));
  handleIPC('faculty:create', (input: any) => facultyService.create(input));
  handleIPC('faculty:update', ({ id, input }: any) => facultyService.update(id, input));
  handleIPC('faculty:delete', (id: string) => facultyService.delete(id));

  // Subjects
  handleIPC('subjects:list', (filters: any) => subjectService.list(filters));
  handleIPC('subjects:getById', (id: string) => subjectService.getById(id));
  handleIPC('subjects:create', (input: any) => subjectService.create(input));
  handleIPC('subjects:update', ({ id, input }: any) => subjectService.update(id, input));
  handleIPC('subjects:delete', (id: string) => subjectService.delete(id));

  // Schedules
  handleIPC('schedules:list', (filters: any) => scheduleService.list(filters));
  handleIPC('schedules:getById', (id: string) => scheduleService.getById(id));
  handleIPC('schedules:create', (input: any) => scheduleService.create(input));
  handleIPC('schedules:update', ({ id, input }: any) => scheduleService.update(id, input));
  handleIPC('schedules:delete', (id: string) => scheduleService.delete(id));

  // Dashboard
  handleIPC('dashboard:getSummary', () => dashboardService.getSummary());

  // Reports
  handleIPC('reports:getRoomUtilization', (filters: any) => reportService.getRoomUtilization(filters));
  handleIPC('reports:exportCsv', (options: any) => reportService.exportCsv(options));

  // Settings
  handleIPC('settings:get', () => settingsService.getAll());
  handleIPC('settings:update', (input: any) => settingsService.update(input));

  // Database
  handleIPC('database:checkHealth', () => databaseService.checkHealth());
  handleIPC('database:seedDemoData', () => databaseService.seedDemoData());
  handleIPC('database:clearWorkspace', () => databaseService.clearWorkspace());
}
