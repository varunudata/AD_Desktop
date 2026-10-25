import { describe, it, expect } from 'vitest';
import {
  classroomSchema,
  facultySchema,
  subjectSchema,
  scheduleSchema,
} from '../../src/shared/schemas/validation';

describe('Validation Schemas (Zod)', () => {
  describe('classroomSchema', () => {
    it('validates valid classroom data', () => {
      const valid = {
        code: 'LH-101',
        name: 'Main Auditorium',
        building: 'Science Block',
        capacity: 120,
        roomType: 'LECTURE_HALL',
        equipment: ['Projector', 'Audio'],
        isActive: true,
      };
      expect(() => classroomSchema.parse(valid)).not.toThrow();
    });

    it('rejects non-positive capacity', () => {
      const invalid = {
        code: 'LH-101',
        name: 'Main Auditorium',
        building: 'Science Block',
        capacity: 0,
      };
      expect(() => classroomSchema.parse(invalid)).toThrow();
    });

    it('rejects empty room code', () => {
      const invalid = {
        code: '',
        name: 'Main Auditorium',
        building: 'Science Block',
        capacity: 50,
      };
      expect(() => classroomSchema.parse(invalid)).toThrow();
    });
  });

  describe('scheduleSchema', () => {
    it('validates valid schedule with start time before end time', () => {
      const valid = {
        subjectId: 'sub-1',
        facultyId: 'fac-1',
        classroomId: 'room-1',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '10:30',
        expectedStudents: 40,
      };
      expect(() => scheduleSchema.parse(valid)).not.toThrow();
    });

    it('rejects schedule when endTime is earlier than startTime', () => {
      const invalid = {
        subjectId: 'sub-1',
        facultyId: 'fac-1',
        classroomId: 'room-1',
        dayOfWeek: 'MONDAY',
        startTime: '11:00',
        endTime: '10:00',
        expectedStudents: 40,
      };
      expect(() => scheduleSchema.parse(invalid)).toThrow(/End time must be after start time/);
    });

    it('rejects schedule when startTime equals endTime', () => {
      const invalid = {
        subjectId: 'sub-1',
        facultyId: 'fac-1',
        classroomId: 'room-1',
        dayOfWeek: 'MONDAY',
        startTime: '10:00',
        endTime: '10:00',
        expectedStudents: 40,
      };
      expect(() => scheduleSchema.parse(invalid)).toThrow();
    });

    it('rejects invalid time formats', () => {
      const invalid = {
        subjectId: 'sub-1',
        facultyId: 'fac-1',
        classroomId: 'room-1',
        dayOfWeek: 'MONDAY',
        startTime: '9:00 AM', // not 24h HH:mm
        endTime: '10:30',
        expectedStudents: 40,
      };
      expect(() => scheduleSchema.parse(invalid)).toThrow();
    });
  });
});
