import { subjectRepository } from '../repositories/subjectRepository';
import { subjectSchema, updateSubjectSchema } from '../../shared/schemas/validation';
import { Subject } from '../../shared/types/models';
import { SubjectFilter } from '../../shared/types/ipc';
import { CreateSubjectInput, UpdateSubjectInput } from '../../shared/types/api';
import { AppError } from '../utils/errors';

export const subjectService = {
  async list(filters?: SubjectFilter): Promise<Subject[]> {
    return subjectRepository.list(filters);
  },

  async getById(id: string): Promise<Subject | null> {
    return subjectRepository.getById(id);
  },

  async create(input: CreateSubjectInput): Promise<Subject> {
    const validated = subjectSchema.parse(input);

    // Check for duplicate subject code
    const existing = await subjectRepository.getByCode(validated.code);
    if (existing) {
      throw new AppError(
        'DUPLICATE_CODE',
        `Subject code "${validated.code}" is already in use by "${existing.name}".`
      );
    }

    return subjectRepository.create(validated);
  },

  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    const validated = updateSubjectSchema.parse(input);

    const existing = await subjectRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Subject not found.');
    }

    if (validated.code && validated.code.toUpperCase() !== existing.code.toUpperCase()) {
      const codeCheck = await subjectRepository.getByCode(validated.code);
      if (codeCheck && codeCheck.id !== id) {
        throw new AppError(
          'DUPLICATE_CODE',
          `Subject code "${validated.code}" is already in use by "${codeCheck.name}".`
        );
      }
    }

    return subjectRepository.update(id, validated);
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const existing = await subjectRepository.getById(id);
    if (!existing) {
      throw new AppError('RECORD_NOT_FOUND', 'Subject not found.');
    }

    // Safety rule: Prevent deletion if scheduled classes reference this subject
    const scheduleCount = await subjectRepository.countSchedules(id);
    if (scheduleCount > 0) {
      throw new AppError(
        'REFERENCED_RECORD_CONFLICT',
        `Cannot delete subject "${existing.code} - ${existing.name}" because it is currently assigned to ${scheduleCount} scheduled class(es). Please reassign or delete these schedules first, or mark the subject as inactive.`,
        { scheduleCount }
      );
    }

    return subjectRepository.delete(id);
  },
};
