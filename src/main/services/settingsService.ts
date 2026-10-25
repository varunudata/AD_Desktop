import { settingsRepository } from '../repositories/settingsRepository';
import { settingsSchema } from '../../shared/schemas/validation';
import { UpdateSettingsInput } from '../../shared/types/api';

export const settingsService = {
  async getAll(): Promise<Record<string, string>> {
    return settingsRepository.getAll();
  },

  async update(input: UpdateSettingsInput): Promise<Record<string, string>> {
    const validated = settingsSchema.parse(input);
    const updates: Record<string, string> = {};

    if (validated.institution_name !== undefined) {
      updates.institution_name = validated.institution_name;
    }
    if (validated.academic_term !== undefined) {
      updates.academic_term = validated.academic_term;
    }
    if (validated.working_days !== undefined) {
      updates.working_days = JSON.stringify(validated.working_days);
    }
    if (validated.working_hours !== undefined) {
      updates.working_hours = validated.working_hours;
    }
    if (validated.timetable_start_time !== undefined) {
      updates.timetable_start_time = validated.timetable_start_time;
    }
    if (validated.timetable_end_time !== undefined) {
      updates.timetable_end_time = validated.timetable_end_time;
    }
    if (validated.default_class_duration !== undefined) {
      updates.default_class_duration = String(validated.default_class_duration);
    }
    if (validated.available_daily_teaching_hours !== undefined) {
      updates.available_daily_teaching_hours = String(validated.available_daily_teaching_hours);
    }

    return settingsRepository.setMany(updates);
  },
};
