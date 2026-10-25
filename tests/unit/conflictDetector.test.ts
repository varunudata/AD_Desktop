import { describe, it, expect } from 'vitest';
import { intervalsOverlap, detectScheduleConflicts } from '../../src/main/services/conflictDetector';

describe('Interval Overlap Logic (intervalsOverlap)', () => {
  it('correctly identifies non-overlapping adjacent / back-to-back classes', () => {
    // 10:00-11:00 and 11:00-12:00 should NOT overlap
    expect(intervalsOverlap('10:00', '11:00', '11:00', '12:00')).toBe(false);
    expect(intervalsOverlap('11:00', '12:00', '10:00', '11:00')).toBe(false);
  });

  it('detects partial overlap when requested class starts before existing ends', () => {
    // 10:00-11:30 and 11:00-12:00
    expect(intervalsOverlap('10:00', '11:30', '11:00', '12:00')).toBe(true);
  });

  it('detects partial overlap when requested class starts during existing interval', () => {
    // 09:00-10:30 and 10:00-11:00
    expect(intervalsOverlap('09:00', '10:30', '10:00', '11:00')).toBe(true);
  });

  it('detects overlap when one class interval is completely inside another', () => {
    // 09:00-12:00 and 10:00-11:00
    expect(intervalsOverlap('09:00', '12:00', '10:00', '11:00')).toBe(true);
    expect(intervalsOverlap('10:00', '11:00', '09:00', '12:00')).toBe(true);
  });

  it('detects exact same interval overlap', () => {
    expect(intervalsOverlap('10:00', '11:00', '10:00', '11:00')).toBe(true);
  });

  it('returns false for completely disjoint time intervals', () => {
    expect(intervalsOverlap('09:00', '10:00', '14:00', '15:00')).toBe(false);
  });
});

describe('Schedule Conflict Detection (detectScheduleConflicts)', () => {
  const dummyClassroom = {
    id: 'room-1',
    code: 'LH-101',
    capacity: 60,
    equipment: ['Projector', 'Audio System', 'Whiteboard'],
  };

  const dummySubject = {
    id: 'sub-1',
    name: 'Database Systems',
    requiredEquipment: ['Projector'],
  };

  const existingSchedules = [
    {
      id: 'sched-100',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      dayOfWeek: 'MONDAY',
      startTime: '10:00',
      endTime: '11:30',
      subject: { name: 'Operating Systems', code: 'CS-302' },
      classroom: { code: 'LH-101', name: 'Turing Hall' },
      faculty: { fullName: 'Dr. Ada Lovelace' },
    },
    {
      id: 'sched-200',
      classroomId: 'room-2',
      facultyId: 'fac-2',
      dayOfWeek: 'MONDAY',
      startTime: '14:00',
      endTime: '15:30',
      subject: { name: 'Discrete Math', code: 'MATH-201' },
      classroom: { code: 'CR-302', name: 'Room 302' },
      faculty: { fullName: 'Dr. Claude Shannon' },
    },
  ];

  it('rejects booking when end time is equal to or before start time', () => {
    const res = detectScheduleConflicts({
      dayOfWeek: 'MONDAY',
      startTime: '11:00',
      endTime: '10:00',
      classroomId: 'room-3',
      facultyId: 'fac-3',
      expectedStudents: 30,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(true);
    expect(res.blockingConflict?.code).toBe('INVALID_TIME_RANGE');
  });

  it('rejects room conflict when same room is requested during overlapping interval', () => {
    const res = detectScheduleConflicts({
      dayOfWeek: 'MONDAY',
      startTime: '10:30',
      endTime: '12:00', // overlaps with sched-100 (10:00-11:30 in room-1)
      classroomId: 'room-1',
      facultyId: 'fac-3', // different faculty
      expectedStudents: 40,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(true);
    expect(res.blockingConflict?.code).toBe('ROOM_CONFLICT');
    expect(res.blockingConflict?.message).toContain('already booked');
  });

  it('rejects faculty conflict when same faculty is scheduled for overlapping interval', () => {
    const res = detectScheduleConflicts({
      dayOfWeek: 'MONDAY',
      startTime: '11:00',
      endTime: '12:30', // overlaps with sched-100 (10:00-11:30)
      classroomId: 'room-99', // different room
      facultyId: 'fac-1', // same faculty!
      expectedStudents: 30,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(true);
    expect(res.blockingConflict?.code).toBe('FACULTY_CONFLICT');
    expect(res.blockingConflict?.message).toContain('already scheduled to teach');
  });

  it('allows scheduling when intervals do not overlap (back-to-back)', () => {
    const res = detectScheduleConflicts({
      dayOfWeek: 'MONDAY',
      startTime: '11:30', // starts exactly when sched-100 ends
      endTime: '13:00',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      expectedStudents: 45,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(false);
  });

  it('allows scheduling on a different day of the week even at the exact same time', () => {
    const res = detectScheduleConflicts({
      dayOfWeek: 'TUESDAY', // different day
      startTime: '10:00',
      endTime: '11:30',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      expectedStudents: 40,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(false);
  });

  it('allows updating an existing schedule without self-conflict', () => {
    // When editing sched-100, its own slot must not conflict with itself
    const res = detectScheduleConflicts({
      scheduleId: 'sched-100', // exclude self
      dayOfWeek: 'MONDAY',
      startTime: '10:00',
      endTime: '11:30',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      expectedStudents: 40,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(false);
  });

  it('rejects updating an existing schedule into another booking slot', () => {
    // Editing sched-100 into sched-200's slot (14:00-15:30, room-2, fac-2)
    const res = detectScheduleConflicts({
      scheduleId: 'sched-100',
      dayOfWeek: 'MONDAY',
      startTime: '14:30',
      endTime: '16:00',
      classroomId: 'room-2', // booked by sched-200!
      facultyId: 'fac-1',
      expectedStudents: 30,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(true);
    expect(res.blockingConflict?.code).toBe('ROOM_CONFLICT');
  });

  it('generates capacity warning and blocks unless override is requested', () => {
    // Expected students (80) > room capacity (60)
    const res = detectScheduleConflicts({
      dayOfWeek: 'FRIDAY',
      startTime: '09:00',
      endTime: '10:30',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      expectedStudents: 80,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
      forceBypassCapacityWarning: false,
    });

    expect(res.hasBlockingConflict).toBe(true);
    expect(res.blockingConflict?.message).toContain('insufficient');
  });

  it('permits booking with warning when administrator explicitly bypasses capacity warning', () => {
    const res = detectScheduleConflicts({
      dayOfWeek: 'FRIDAY',
      startTime: '09:00',
      endTime: '10:30',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      expectedStudents: 80,
      classroom: dummyClassroom,
      subject: dummySubject,
      existingSchedules,
      forceBypassCapacityWarning: true,
    });

    expect(res.hasBlockingConflict).toBe(false);
    expect(res.warnings.some((w) => w.type === 'CAPACITY_WARNING')).toBe(true);
  });

  it('detects equipment mismatch when classroom lacks required equipment', () => {
    const subjectWithSpecialLab = {
      id: 'sub-lab',
      name: 'Microscopy Lab',
      requiredEquipment: ['Electron Microscope'],
    };

    const res = detectScheduleConflicts({
      dayOfWeek: 'FRIDAY',
      startTime: '13:00',
      endTime: '14:30',
      classroomId: 'room-1',
      facultyId: 'fac-1',
      expectedStudents: 20,
      classroom: dummyClassroom, // has Projector, Audio, Whiteboard (no Electron Microscope)
      subject: subjectWithSpecialLab,
      existingSchedules,
    });

    expect(res.hasBlockingConflict).toBe(false);
    const equipWarning = res.warnings.find((w) => w.type === 'EQUIPMENT_MISMATCH');
    expect(equipWarning).toBeDefined();
    expect(equipWarning?.message).toContain('Electron Microscope');
  });
});
