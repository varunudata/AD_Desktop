import { z } from 'zod';

export const RoomTypeEnum = z.enum([
  'CLASSROOM',
  'LECTURE_HALL',
  'LABORATORY',
  'SEMINAR_ROOM',
  'WORKSHOP',
]);

export const DayOfWeekEnum = z.enum([
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]);

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const classroomSchema = z.object({
  code: z.string().trim().min(1, 'Room code is required').max(30),
  name: z.string().trim().min(1, 'Room name is required').max(100),
  building: z.string().trim().min(1, 'Building location is required').max(100),
  capacity: z.coerce.number().int().positive('Capacity must be a positive integer'),
  roomType: z.string().default('CLASSROOM'),
  equipment: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  notes: z.string().trim().nullable().optional(),
});

export const updateClassroomSchema = classroomSchema.partial();

export const facultySchema = z.object({
  employeeCode: z.string().trim().nullable().optional(),
  fullName: z.string().trim().min(1, 'Faculty full name is required').max(100),
  department: z.string().trim().min(1, 'Department is required').max(100),
  email: z.string().trim().email('Invalid email address').nullable().optional().or(z.literal('')),
  phone: z.string().trim().nullable().optional(),
  designation: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const updateFacultySchema = facultySchema.partial();

export const subjectSchema = z.object({
  code: z.string().trim().min(1, 'Subject code is required').max(30),
  name: z.string().trim().min(1, 'Subject name is required').max(100),
  department: z.string().trim().min(1, 'Department is required').max(100),
  semester: z.string().trim().nullable().optional(),
  defaultExpectedStudents: z.coerce.number().int().positive().nullable().optional(),
  requiredEquipment: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updateSubjectSchema = subjectSchema.partial();

export const scheduleSchema = z
  .object({
    subjectId: z.string().min(1, 'Subject is required'),
    facultyId: z.string().min(1, 'Faculty member is required'),
    classroomId: z.string().min(1, 'Classroom is required'),
    dayOfWeek: DayOfWeekEnum,
    startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm 24h format'),
    endTime: z.string().regex(timeRegex, 'End time must be in HH:mm 24h format'),
    expectedStudents: z.coerce.number().int().positive('Expected students must be greater than 0'),
    notes: z.string().trim().nullable().optional(),
    forceBypassCapacityWarning: z.boolean().optional(),
  })
  .refine(
    (data) => {
      return data.startTime < data.endTime;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const updateScheduleSchema = z
  .object({
    subjectId: z.string().min(1).optional(),
    facultyId: z.string().min(1).optional(),
    classroomId: z.string().min(1).optional(),
    dayOfWeek: DayOfWeekEnum.optional(),
    startTime: z.string().regex(timeRegex).optional(),
    endTime: z.string().regex(timeRegex).optional(),
    expectedStudents: z.coerce.number().int().positive().optional(),
    notes: z.string().trim().nullable().optional(),
    forceBypassCapacityWarning: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const settingsSchema = z.object({
  institution_name: z.string().min(1).optional(),
  academic_term: z.string().optional(),
  working_days: z.array(DayOfWeekEnum).optional(),
  working_hours: z.string().optional(),
  timetable_start_time: z.string().regex(timeRegex).optional(),
  timetable_end_time: z.string().regex(timeRegex).optional(),
  default_class_duration: z.coerce.number().int().positive().optional(),
  available_daily_teaching_hours: z.coerce.number().positive().optional(),
});
