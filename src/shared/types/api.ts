import {
  Classroom,
  Faculty,
  Subject,
  Schedule,
  ScheduleWithRelations,
  DashboardSummary,
  RoomUtilization,
  DatabaseHealthStatus,
  Setting,
} from './models';
import {
  ClassroomFilter,
  FacultyFilter,
  SubjectFilter,
  ScheduleFilter,
  UtilizationFilter,
  ExportCsvOptions,
  ExportCsvResult,
  IPCResult,
} from './ipc';

export interface CreateClassroomInput {
  code: string;
  name: string;
  building: string;
  capacity: number;
  roomType: string;
  equipment?: string[];
  isActive?: boolean;
  notes?: string | null;
}

export interface UpdateClassroomInput extends Partial<CreateClassroomInput> {}

export interface CreateFacultyInput {
  employeeCode?: string | null;
  fullName: string;
  department: string;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  isActive?: boolean;
}

export interface UpdateFacultyInput extends Partial<CreateFacultyInput> {}

export interface CreateSubjectInput {
  code: string;
  name: string;
  department: string;
  semester?: string | null;
  defaultExpectedStudents?: number | null;
  requiredEquipment?: string[];
  isActive?: boolean;
}

export interface UpdateSubjectInput extends Partial<CreateSubjectInput> {}

export interface CreateScheduleInput {
  subjectId: string;
  facultyId: string;
  classroomId: string;
  dayOfWeek: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  expectedStudents: number;
  notes?: string | null;
  forceBypassCapacityWarning?: boolean;
}

export interface UpdateScheduleInput extends Partial<CreateScheduleInput> {}

export interface UpdateSettingsInput {
  institution_name?: string;
  academic_term?: string;
  working_days?: string[];
  working_hours?: string;
  timetable_start_time?: string;
  timetable_end_time?: string;
  default_class_duration?: number | string;
  available_daily_teaching_hours?: number | string;
}

export interface ClassFlowAPI {
  classrooms: {
    list: (filters?: ClassroomFilter) => Promise<IPCResult<Classroom[]>>;
    getById: (id: string) => Promise<IPCResult<Classroom | null>>;
    create: (input: CreateClassroomInput) => Promise<IPCResult<Classroom>>;
    update: (id: string, input: UpdateClassroomInput) => Promise<IPCResult<Classroom>>;
    delete: (id: string) => Promise<IPCResult<{ deleted: boolean; id: string }>>;
  };
  faculty: {
    list: (filters?: FacultyFilter) => Promise<IPCResult<Faculty[]>>;
    getById: (id: string) => Promise<IPCResult<Faculty | null>>;
    create: (input: CreateFacultyInput) => Promise<IPCResult<Faculty>>;
    update: (id: string, input: UpdateFacultyInput) => Promise<IPCResult<Faculty>>;
    delete: (id: string) => Promise<IPCResult<{ deleted: boolean; id: string }>>;
  };
  subjects: {
    list: (filters?: SubjectFilter) => Promise<IPCResult<Subject[]>>;
    getById: (id: string) => Promise<IPCResult<Subject | null>>;
    create: (input: CreateSubjectInput) => Promise<IPCResult<Subject>>;
    update: (id: string, input: UpdateSubjectInput) => Promise<IPCResult<Subject>>;
    delete: (id: string) => Promise<IPCResult<{ deleted: boolean; id: string }>>;
  };
  schedules: {
    list: (filters?: ScheduleFilter) => Promise<IPCResult<ScheduleWithRelations[]>>;
    getById: (id: string) => Promise<IPCResult<ScheduleWithRelations | null>>;
    create: (input: CreateScheduleInput) => Promise<IPCResult<ScheduleWithRelations>>;
    update: (id: string, input: UpdateScheduleInput) => Promise<IPCResult<ScheduleWithRelations>>;
    delete: (id: string) => Promise<IPCResult<{ deleted: boolean; id: string }>>;
  };
  dashboard: {
    getSummary: () => Promise<IPCResult<DashboardSummary>>;
  };
  reports: {
    getRoomUtilization: (filters?: UtilizationFilter) => Promise<IPCResult<RoomUtilization[]>>;
    exportCsv: (options: ExportCsvOptions) => Promise<IPCResult<ExportCsvResult>>;
  };
  settings: {
    get: () => Promise<IPCResult<Record<string, string>>>;
    update: (input: UpdateSettingsInput) => Promise<IPCResult<Record<string, string>>>;
  };
  database: {
    checkHealth: () => Promise<IPCResult<DatabaseHealthStatus>>;
    seedDemoData: () => Promise<IPCResult<{ success: boolean; message: string }>>;
    clearWorkspace: () => Promise<IPCResult<{ success: boolean; message: string }>>;
  };
}

declare global {
  interface Window {
    classflowAPI: ClassFlowAPI;
  }
}
