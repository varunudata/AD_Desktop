import { classroomRepository } from '../repositories/classroomRepository';
import { classroomSchema, updateClassroomSchema } from '../../shared/schemas/validation';
import { Classroom } from '../../shared/types/models';
import { ClassroomFilter } from '../../shared/types/ipc';
import { CreateClassroomInput, UpdateClassroomInput } from '../../shared/types/api';
import { AppError } from '../utils/errors';

export const classroomService = {
  async list(filters?: ClassroomFilter): Promise<Classroom[]> {
    return classroomRepository.list(filters);
  },

  async getById(id: string): Promise<Classroom | null> {
    return classroomRepository.getById(id);
  },

  async create(input: CreateClassroomInput): Promise<Classroom> {
    const validated = classroomSchema.parse(input);

    // Check for duplicate room code
    const existing = await classroomRepository.getByCode(validated.code);
    if (existing) {
      throw new AppError(
        'DUPLICATE_CODE',
        `Classroom code "${validated.code}" is already in use by "${existing.name}".`
      );
    }

    return classroomRepository.create(validated);
  },

  async update(id: string, input: UpdateClassroomInput): Promise<Classroom> {
    const validated = updateClassroomSchema.parse(input);

    const existing = await classroomRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Classroom not found.');
    }

    if (validated.code && validated.code.toUpperCase() !== existing.code.toUpperCase()) {
      const codeCheck = await classroomRepository.getByCode(validated.code);
      if (codeCheck && codeCheck.id !== id) {
        throw new AppError(
          'DUPLICATE_CODE',
          `Classroom code "${validated.code}" is already in use by "${codeCheck.name}".`
        );
      }
    }

    return classroomRepository.update(id, validated);
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const existing = await classroomRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Classroom not found.');
    }

    // Safety rule: Prevent deletion if scheduled classes reference this room
    const scheduleCount = await classroomRepository.countSchedules(id);
    if (scheduleCount > 0) {
      throw new AppError(
        'REFERENCED_RECORD_CONFLICT',
        `Cannot delete classroom "${existing.code}" because it is currently assigned to ${scheduleCount} scheduled class(es). Please reassign or delete these schedules first, or deactivate the room.`,
        { scheduleCount }
      );
    }

    return classroomRepository.delete(id);
  },
};
