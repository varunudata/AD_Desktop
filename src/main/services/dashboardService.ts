import { getPrisma } from '../database/prisma';
import { scheduleRepository } from '../repositories/scheduleRepository';
import { DashboardSummary, CapacityWarning, ConflictAlert, DayOfWeek } from '../../shared/types/models';

function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  return days[new Date().getDay()];
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const prisma = getPrisma();
    const today = getTodayDayOfWeek();

    // Parallel counts from PostgreSQL
    const [
      totalClassrooms,
      totalFaculty,
      totalSubjects,
      totalSchedules,
      activeRoomsCount,
      allClassrooms,
      allSchedules,
      todaySchedules,
    ] = await Promise.all([
      prisma.classroom.count(),
      prisma.faculty.count(),
      prisma.subject.count(),
      prisma.schedule.count(),
      prisma.classroom.count({ where: { isActive: true } }),
      prisma.classroom.findMany({ select: { id: true, code: true, roomType: true, capacity: true } }),
      scheduleRepository.list(),
      scheduleRepository.list({ dayOfWeek: today }),
    ]);

    // Room type breakdown
    const roomTypeCounts: Record<string, number> = {};
    for (const c of allClassrooms) {
      roomTypeCounts[c.roomType] = (roomTypeCounts[c.roomType] || 0) + 1;
    }
    const roomTypeBreakdown = Object.entries(roomTypeCounts).map(([type, count]) => ({
      type,
      count,
    }));

    // Detect capacity warnings across all schedules
    const capacityWarnings: CapacityWarning[] = [];
    for (const s of allSchedules) {
      if (s.expectedStudents > s.classroom.capacity) {
        capacityWarnings.push({
          scheduleId: s.id,
          subjectName: s.subject.name,
          classroomCode: s.classroom.code,
          capacity: s.classroom.capacity,
          expectedStudents: s.expectedStudents,
          excess: s.expectedStudents - s.classroom.capacity,
        });
      }
    }

    // Available rooms today (active rooms with 0 or low bookings today)
    const bookedRoomsToday = new Set(todaySchedules.map((s) => s.classroomId));
    const availableRoomsToday = Math.max(0, activeRoomsCount - bookedRoomsToday.size);

    return {
      totalClassrooms,
      totalFaculty,
      totalSubjects,
      totalSchedules,
      todayClassesCount: todaySchedules.length,
      activeRoomsCount,
      availableRoomsToday,
      todaySchedules,
      conflictAlerts: [],
      capacityWarnings,
      roomTypeBreakdown,
    };
  },
};
