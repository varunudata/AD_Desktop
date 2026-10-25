import { classroomRepository } from '../repositories/classroomRepository';
import { facultyRepository } from '../repositories/facultyRepository';
import { subjectRepository } from '../repositories/subjectRepository';
import { scheduleRepository } from '../repositories/scheduleRepository';
import { settingsRepository } from '../repositories/settingsRepository';
import { RoomUtilization } from '../../shared/types/models';
import { UtilizationFilter, ExportCsvOptions, ExportCsvResult } from '../../shared/types/ipc';
import { generateCsv, promptAndSaveCsv } from '../utils/csvExport';
import { AppError } from '../utils/errors';

function calculateHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  return Math.max(0, totalMinutes / 60);
}

export const reportService = {
  async getRoomUtilization(filters?: UtilizationFilter): Promise<RoomUtilization[]> {
    const classrooms = await classroomRepository.list({
      building: filters?.building,
      isActive: true,
    });

    const schedules = await scheduleRepository.list({
      dayOfWeek: filters?.dayOfWeek,
    });

    // Read available daily teaching hours setting (default 10)
    const availableSetting = await settingsRepository.get('available_daily_teaching_hours');
    const baseDailyHours = availableSetting ? Number(availableSetting) : 10;
    // If filtering by a single day, available hours is baseDailyHours; if all week (5 days), it's baseDailyHours * 5
    const totalAvailableHours = filters?.dayOfWeek ? baseDailyHours : baseDailyHours * 5;

    // Group schedule hours by room
    const roomHours: Record<string, { hours: number; count: number }> = {};
    for (const s of schedules) {
      if (!roomHours[s.classroomId]) {
        roomHours[s.classroomId] = { hours: 0, count: 0 };
      }
      roomHours[s.classroomId].hours += calculateHours(s.startTime, s.endTime);
      roomHours[s.classroomId].count += 1;
    }

    return classrooms.map((room) => {
      const stats = roomHours[room.id] || { hours: 0, count: 0 };
      const scheduledHours = Number(stats.hours.toFixed(1));
      const percentage = totalAvailableHours > 0
        ? Math.min(100, Number(((scheduledHours / totalAvailableHours) * 100).toFixed(1)))
        : 0;

      return {
        classroomId: room.id,
        classroomCode: room.code,
        classroomName: room.name,
        capacity: room.capacity,
        roomType: String(room.roomType),
        scheduledHours,
        availableHours: totalAvailableHours,
        utilizationPercentage: percentage,
        classesCount: stats.count,
      };
    });
  },

  async exportCsv(options: ExportCsvOptions): Promise<ExportCsvResult> {
    let headers: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];
    let defaultFilename = `classflow_${options.type}_${new Date().toISOString().split('T')[0]}.csv`;

    switch (options.type) {
      case 'timetable': {
        const schedules = await scheduleRepository.list(options.filters);
        headers = [
          'Day of Week',
          'Start Time',
          'End Time',
          'Subject Code',
          'Subject Name',
          'Classroom Code',
          'Building',
          'Faculty Name',
          'Expected Students',
          'Notes',
        ];
        rows = schedules.map((s) => [
          s.dayOfWeek,
          s.startTime,
          s.endTime,
          s.subject.code,
          s.subject.name,
          s.classroom.code,
          s.classroom.building,
          s.faculty.fullName,
          s.expectedStudents,
          s.notes || '',
        ]);
        break;
      }

      case 'classrooms': {
        const classrooms = await classroomRepository.list();
        headers = ['Code', 'Name', 'Building', 'Capacity', 'Room Type', 'Equipment', 'Active', 'Notes'];
        rows = classrooms.map((c) => [
          c.code,
          c.name,
          c.building,
          c.capacity,
          c.roomType,
          c.equipment.join('; '),
          c.isActive ? 'Yes' : 'No',
          c.notes || '',
        ]);
        break;
      }

      case 'faculty': {
        const facultyList = await facultyRepository.list();
        headers = ['Employee Code', 'Full Name', 'Department', 'Email', 'Phone', 'Designation', 'Active'];
        rows = facultyList.map((f) => [
          f.employeeCode || '',
          f.fullName,
          f.department,
          f.email || '',
          f.phone || '',
          f.designation || '',
          f.isActive ? 'Yes' : 'No',
        ]);
        break;
      }

      case 'subjects': {
        const subjects = await subjectRepository.list();
        headers = ['Code', 'Name', 'Department', 'Semester', 'Default Class Size', 'Required Equipment', 'Active'];
        rows = subjects.map((sub) => [
          sub.code,
          sub.name,
          sub.department,
          sub.semester || '',
          sub.defaultExpectedStudents || '',
          sub.requiredEquipment.join('; '),
          sub.isActive ? 'Yes' : 'No',
        ]);
        break;
      }

      case 'utilization': {
        const utilization = await this.getRoomUtilization(options.filters);
        headers = [
          'Classroom Code',
          'Room Name',
          'Room Type',
          'Capacity',
          'Scheduled Hours',
          'Available Hours',
          'Utilization %',
          'Classes Scheduled',
        ];
        rows = utilization.map((u) => [
          u.classroomCode,
          u.classroomName,
          u.roomType,
          u.capacity,
          u.scheduledHours,
          u.availableHours,
          `${u.utilizationPercentage}%`,
          u.classesCount,
        ]);
        break;
      }

      default:
        throw new AppError('INVALID_EXPORT_TYPE', 'Unknown export type requested.');
    }

    const csvContent = generateCsv(headers, rows);
    const saveResult = await promptAndSaveCsv(defaultFilename, csvContent);

    return {
      saved: saveResult.saved,
      filePath: saveResult.filePath,
      recordsCount: rows.length,
    };
  },
};
