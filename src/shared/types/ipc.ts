import {
  Classroom,
  Faculty,
  Subject,
  ScheduleWithRelations,
  DashboardSummary,
  RoomUtilization,
  DatabaseHealthStatus,
  DayOfWeek,
} from './models';

export interface IPCSuccess<T> {
  success: true;
  data: T;
}

export interface IPCError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type IPCResult<T> = IPCSuccess<T> | IPCError;

export interface ClassroomFilter {
  search?: string;
  building?: string;
  roomType?: string;
  isActive?: boolean;
}

export interface FacultyFilter {
  search?: string;
  department?: string;
  isActive?: boolean;
}

export interface SubjectFilter {
  search?: string;
  department?: string;
  semester?: string;
  isActive?: boolean;
}

export interface ScheduleFilter {
  dayOfWeek?: DayOfWeek | string;
  classroomId?: string;
  facultyId?: string;
  subjectId?: string;
  search?: string;
}

export interface UtilizationFilter {
  dayOfWeek?: string;
  building?: string;
}

export interface ExportCsvOptions {
  type: 'timetable' | 'classrooms' | 'faculty' | 'subjects' | 'utilization';
  filters?: Record<string, unknown>;
}

export interface ExportCsvResult {
  saved: boolean;
  filePath?: string;
  recordsCount: number;
}
