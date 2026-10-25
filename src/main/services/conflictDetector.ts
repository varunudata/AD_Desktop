import { Schedule, Classroom, Subject, ConflictAlert } from '../../shared/types/models';

/**
 * Deterministic interval overlap check.
 * Two intervals overlap if and only if:
 * existingStart < requestedEnd && requestedStart < existingEnd
 *
 * Examples:
 * - 10:00-11:00 and 11:00-12:00 => false (adjacent/back-to-back, no conflict)
 * - 10:00-11:30 and 11:00-12:00 => true (conflict)
 * - 09:00-10:30 and 10:00-11:00 => true (conflict)
 * - 09:00-12:00 and 10:00-11:00 => true (fully contained)
 */
export function intervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return startA < endB && startB < endA;
}

export interface ConflictCheckParams {
  scheduleId?: string; // If editing, exclude this ID
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classroomId: string;
  facultyId: string;
  expectedStudents: number;
  classroom: {
    id: string;
    code: string;
    capacity: number;
    equipment: string[];
  };
  subject: {
    id: string;
    name: string;
    requiredEquipment: string[];
  };
  existingSchedules: Array<{
    id: string;
    classroomId: string;
    facultyId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    subject?: { name: string; code: string };
    classroom?: { code: string; name: string };
    faculty?: { fullName: string };
  }>;
  forceBypassCapacityWarning?: boolean;
}

export interface ConflictCheckResult {
  hasBlockingConflict: boolean;
  blockingConflict?: {
    code: 'ROOM_CONFLICT' | 'FACULTY_CONFLICT' | 'INVALID_TIME_RANGE';
    message: string;
    existingScheduleId?: string;
  };
  warnings: ConflictAlert[];
}

export function detectScheduleConflicts(params: ConflictCheckParams): ConflictCheckResult {
  const {
    scheduleId,
    dayOfWeek,
    startTime,
    endTime,
    classroomId,
    facultyId,
    expectedStudents,
    classroom,
    subject,
    existingSchedules,
    forceBypassCapacityWarning,
  } = params;

  // 1. Time range validity
  if (startTime >= endTime) {
    return {
      hasBlockingConflict: true,
      blockingConflict: {
        code: 'INVALID_TIME_RANGE',
        message: `End time (${endTime}) must be strictly after start time (${startTime}).`,
      },
      warnings: [],
    };
  }

  // 2. Evaluate existing schedules on the same day of week
  const sameDaySchedules = existingSchedules.filter(
    (s) => s.dayOfWeek.toUpperCase() === dayOfWeek.toUpperCase() && s.id !== scheduleId
  );

  for (const existing of sameDaySchedules) {
    if (intervalsOverlap(existing.startTime, existing.endTime, startTime, endTime)) {
      // Room conflict: Same classroom booked at overlapping interval
      if (existing.classroomId === classroomId) {
        const roomName = existing.classroom?.code || classroom.code;
        const subjName = existing.subject?.name ? ` for "${existing.subject.name}"` : '';
        return {
          hasBlockingConflict: true,
          blockingConflict: {
            code: 'ROOM_CONFLICT',
            message: `Room conflict: Classroom ${roomName} is already booked from ${existing.startTime} to ${existing.endTime}${subjName}.`,
            existingScheduleId: existing.id,
          },
          warnings: [],
        };
      }

      // Faculty conflict: Same faculty member assigned to overlapping interval
      if (existing.facultyId === facultyId) {
        const facultyName = existing.faculty?.fullName || 'This faculty member';
        const subjName = existing.subject?.name ? ` ("${existing.subject.name}")` : '';
        return {
          hasBlockingConflict: true,
          blockingConflict: {
            code: 'FACULTY_CONFLICT',
            message: `Faculty conflict: ${facultyName} is already scheduled to teach${subjName} from ${existing.startTime} to ${existing.endTime}.`,
            existingScheduleId: existing.id,
          },
          warnings: [],
        };
      }
    }
  }

  const warnings: ConflictAlert[] = [];

  // 3. Capacity warning check
  if (expectedStudents > classroom.capacity) {
    const excess = expectedStudents - classroom.capacity;
    warnings.push({
      type: 'CAPACITY_WARNING',
      message: `Capacity warning: Expected attendance (${expectedStudents}) exceeds classroom ${classroom.code} capacity (${classroom.capacity}) by ${excess} students.`,
      details: {
        classroomCode: classroom.code,
        capacity: classroom.capacity,
        expectedStudents,
        excess,
      },
    });

    if (!forceBypassCapacityWarning) {
      // If administrator has not explicitly confirmed, treat as blocking
      return {
        hasBlockingConflict: true,
        blockingConflict: {
          code: 'ROOM_CONFLICT', // structured warning
          message: `Classroom ${classroom.code} capacity (${classroom.capacity}) is insufficient for ${expectedStudents} students. Please select a larger room or confirm override.`,
        },
        warnings,
      };
    }
  }

  // 4. Equipment mismatch check
  if (subject.requiredEquipment && subject.requiredEquipment.length > 0) {
    const roomEqSet = new Set(classroom.equipment.map((e) => e.toLowerCase().trim()));
    const missingEquipment = subject.requiredEquipment.filter(
      (req) => !roomEqSet.has(req.toLowerCase().trim())
    );

    if (missingEquipment.length > 0) {
      warnings.push({
        type: 'EQUIPMENT_MISMATCH',
        message: `Equipment notice: Classroom ${classroom.code} may lack required equipment: ${missingEquipment.join(', ')}.`,
        details: { missingEquipment },
      });
    }
  }

  return {
    hasBlockingConflict: false,
    warnings,
  };
}
