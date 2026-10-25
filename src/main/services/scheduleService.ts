import { getPrisma } from '../database/prisma';
import { scheduleRepository } from '../repositories/scheduleRepository';
import { classroomRepository } from '../repositories/classroomRepository';
import { facultyRepository } from '../repositories/facultyRepository';
import { subjectRepository } from '../repositories/subjectRepository';
import { scheduleSchema, updateScheduleSchema } from '../../shared/schemas/validation';
import { ScheduleWithRelations } from '../../shared/types/models';
import { ScheduleFilter } from '../../shared/types/ipc';
import { CreateScheduleInput, UpdateScheduleInput } from '../../shared/types/api';
import { detectScheduleConflicts } from './conflictDetector';
import { AppError } from '../utils/errors';

export const scheduleService = {
  async list(filters?: ScheduleFilter): Promise<ScheduleWithRelations[]> {
    return scheduleRepository.list(filters);
  },

  async getById(id: string): Promise<ScheduleWithRelations | null> {
    return scheduleRepository.getById(id);
  },

  async create(input: CreateScheduleInput): Promise<ScheduleWithRelations> {
    const validated = scheduleSchema.parse(input);
    const prisma = getPrisma();

    // Verify referenced entities exist
    const classroom = await classroomRepository.getById(validated.classroomId);
    if (!classroom) {
      throw new AppError('RECORD_NOT_FOUND', 'Selected classroom does not exist.');
    }
    if (!classroom.isActive) {
      throw new AppError('INACTIVE_ENTITY', `Classroom ${classroom.code} is marked inactive and cannot be scheduled.`);
    }

    const faculty = await facultyRepository.getById(validated.facultyId);
    if (!faculty) {
      throw new AppError('RECORD_NOT_FOUND', 'Selected faculty member does not exist.');
    }
    if (!faculty.isActive) {
      throw new AppError('INACTIVE_ENTITY', `Faculty member ${faculty.fullName} is inactive.`);
    }

    const subject = await subjectRepository.getById(validated.subjectId);
    if (!subject) {
      throw new AppError('RECORD_NOT_FOUND', 'Selected subject does not exist.');
    }
    if (!subject.isActive) {
      throw new AppError('INACTIVE_ENTITY', `Subject ${subject.code} is inactive.`);
    }

    // Execute conflict check and write inside a transaction to prevent race conditions
    return prisma.$transaction(async (tx) => {
      // Query all existing schedules for this day of week
      const existingRows = await tx.schedule.findMany({
        where: { dayOfWeek: validated.dayOfWeek },
        include: {
          classroom: { select: { code: true, name: true } },
          subject: { select: { code: true, name: true } },
          faculty: { select: { fullName: true } },
        },
      });

      const conflictCheck = detectScheduleConflicts({
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        classroomId: validated.classroomId,
        facultyId: validated.facultyId,
        expectedStudents: validated.expectedStudents,
        classroom,
        subject,
        existingSchedules: existingRows,
        forceBypassCapacityWarning: validated.forceBypassCapacityWarning,
      });

      if (conflictCheck.hasBlockingConflict && conflictCheck.blockingConflict) {
        throw new AppError(
          conflictCheck.blockingConflict.code,
          conflictCheck.blockingConflict.message,
          {
            existingScheduleId: conflictCheck.blockingConflict.existingScheduleId,
            warnings: conflictCheck.warnings,
          }
        );
      }

      // Save schedule
      const created = await tx.schedule.create({
        data: {
          subjectId: validated.subjectId,
          facultyId: validated.facultyId,
          classroomId: validated.classroomId,
          dayOfWeek: validated.dayOfWeek,
          startTime: validated.startTime,
          endTime: validated.endTime,
          expectedStudents: validated.expectedStudents,
          notes: validated.notes?.trim() || null,
        },
        include: {
          subject: true,
          faculty: true,
          classroom: true,
        },
      });

      return scheduleRepository.getById(created.id) as Promise<ScheduleWithRelations>;
    });
  },

  async update(id: string, input: UpdateScheduleInput): Promise<ScheduleWithRelations> {
    const validated = updateScheduleSchema.parse(input);
    const prisma = getPrisma();

    const existing = await scheduleRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Schedule not found.');
    }

    const classroomId = validated.classroomId ?? existing.classroomId;
    const facultyId = validated.facultyId ?? existing.facultyId;
    const subjectId = validated.subjectId ?? existing.subjectId;
    const dayOfWeek = validated.dayOfWeek ?? existing.dayOfWeek;
    const startTime = validated.startTime ?? existing.startTime;
    const endTime = validated.endTime ?? existing.endTime;
    const expectedStudents = validated.expectedStudents ?? existing.expectedStudents;

    const classroom = await classroomRepository.getById(classroomId);
    if (!classroom) throw new AppError('RECORD_NOT_FOUND', 'Selected classroom does not exist.');

    const faculty = await facultyRepository.getById(facultyId);
    if (!faculty) throw new AppError('RECORD_NOT_FOUND', 'Selected faculty member does not exist.');

    const subject = await subjectRepository.getById(subjectId);
    if (!subject) throw new AppError('RECORD_NOT_FOUND', 'Selected subject does not exist.');

    return prisma.$transaction(async (tx) => {
      const existingRows = await tx.schedule.findMany({
        where: { dayOfWeek },
        include: {
          classroom: { select: { code: true, name: true } },
          subject: { select: { code: true, name: true } },
          faculty: { select: { fullName: true } },
        },
      });

      const conflictCheck = detectScheduleConflicts({
        scheduleId: id, // exclude current schedule!
        dayOfWeek,
        startTime,
        endTime,
        classroomId,
        facultyId,
        expectedStudents,
        classroom,
        subject,
        existingSchedules: existingRows,
        forceBypassCapacityWarning: validated.forceBypassCapacityWarning,
      });

      if (conflictCheck.hasBlockingConflict && conflictCheck.blockingConflict) {
        throw new AppError(
          conflictCheck.blockingConflict.code,
          conflictCheck.blockingConflict.message,
          {
            existingScheduleId: conflictCheck.blockingConflict.existingScheduleId,
            warnings: conflictCheck.warnings,
          }
        );
      }

      await tx.schedule.update({
        where: { id },
        data: {
          subjectId,
          facultyId,
          classroomId,
          dayOfWeek,
          startTime,
          endTime,
          expectedStudents,
          notes: validated.notes !== undefined ? (validated.notes?.trim() || null) : existing.notes,
        },
      });

      return scheduleRepository.getById(id) as Promise<ScheduleWithRelations>;
    });
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const existing = await scheduleRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Schedule not found.');
    }

    return scheduleRepository.delete(id);
  },
};
