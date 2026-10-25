export type RoomType =
  | 'CLASSROOM'
  | 'LECTURE_HALL'
  | 'LABORATORY'
  | 'SEMINAR_ROOM'
  | 'WORKSHOP';

export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface Classroom {
  id: string;
  code: string;
  name: string;
  building: string;
  capacity: number;
  roomType: RoomType | string;
  equipment: string[];
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Faculty {
  id: string;
  employeeCode: string | null;
  fullName: string;
  department: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: string | null;
  defaultExpectedStudents: number | null;
  requiredEquipment: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  subjectId: string;
  facultyId: string;
  classroomId: string;
  dayOfWeek: DayOfWeek | string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  expectedStudents: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleWithRelations extends Schedule {
  subject: Subject;
  faculty: Faculty;
  classroom: Classroom;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface ConflictAlert {
  type: 'ROOM_CONFLICT' | 'FACULTY_CONFLICT' | 'CAPACITY_WARNING' | 'EQUIPMENT_MISMATCH';
  message: string;
  existingScheduleId?: string;
  details?: Record<string, unknown>;
}

export interface CapacityWarning {
  scheduleId?: string;
  subjectName: string;
  classroomCode: string;
  capacity: number;
  expectedStudents: number;
  excess: number;
}

export interface DashboardSummary {
  totalClassrooms: number;
  totalFaculty: number;
  totalSubjects: number;
  totalSchedules: number;
  todayClassesCount: number;
  activeRoomsCount: number;
  availableRoomsToday: number;
  todaySchedules: ScheduleWithRelations[];
  conflictAlerts: ConflictAlert[];
  capacityWarnings: CapacityWarning[];
  roomTypeBreakdown: { type: string; count: number }[];
}

export interface RoomUtilization {
  classroomId: string;
  classroomCode: string;
  classroomName: string;
  capacity: number;
  roomType: string;
  scheduledHours: number;
  availableHours: number;
  utilizationPercentage: number;
  classesCount: number;
}

export interface DatabaseHealthStatus {
  connected: boolean;
  provider: 'postgresql';
  urlConfigured: boolean;
  tablesInitialized: boolean;
  latencyMs?: number;
  error?: string;
}
