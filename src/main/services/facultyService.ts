import { facultyRepository } from '../repositories/facultyRepository';
import { facultySchema, updateFacultySchema } from '../../shared/schemas/validation';
import { Faculty } from '../../shared/types/models';
import { FacultyFilter } from '../../shared/types/ipc';
import { CreateFacultyInput, UpdateFacultyInput } from '../../shared/types/api';
import { AppError } from '../utils/errors';

export const facultyService = {
  async list(filters?: FacultyFilter): Promise<Faculty[]> {
    return facultyRepository.list(filters);
  },

  async getById(id: string): Promise<Faculty | null> {
    return facultyRepository.getById(id);
  },

  async create(input: CreateFacultyInput): Promise<Faculty> {
    const validated = facultySchema.parse(input);
    return facultyRepository.create(validated);
  },

  async update(id: string, input: UpdateFacultyInput): Promise<Faculty> {
    const validated = updateFacultySchema.parse(input);

    const existing = await facultyRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Faculty member not found.');
    }

    return facultyRepository.update(id, validated);
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const existing = await facultyRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Faculty member not found.');
    }

    // Safety rule: Prevent deletion if scheduled classes reference this faculty member
    const scheduleCount = await facultyRepository.countSchedules(id);
    if (scheduleCount > 0) {
      throw new AppError(
        'REFERENCED_RECORD_CONFLICT',
        `Cannot delete faculty member "${existing.fullName}" because they are currently assigned to ${scheduleCount} scheduled class(es). Please reassign or delete these schedules first, or mark the faculty member as inactive.`,
        { scheduleCount }
      );
    }

    return facultyRepository.delete(id);
  },
};
