import { getPrisma } from '../database/prisma';
import { ScheduleWithRelations } from '../../shared/types/models';
import { ScheduleFilter } from '../../shared/types/ipc';
import { CreateScheduleInput, UpdateScheduleInput } from '../../shared/types/api';

function formatScheduleWithRelations(row: any): ScheduleWithRelations {
  let classroomEquipment: string[] = [];
  try {
    classroomEquipment = JSON.parse(row.classroom?.equipment || '[]');
  } catch {
    classroomEquipment = [];
  }

  let subjectRequiredEquipment: string[] = [];
  try {
    subjectRequiredEquipment = JSON.parse(row.subject?.requiredEquipment || '[]');
  } catch {
    subjectRequiredEquipment = [];
  }

  return {
    id: row.id,
    subjectId: row.subjectId,
    facultyId: row.facultyId,
    classroomId: row.classroomId,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    expectedStudents: row.expectedStudents,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    subject: {
      id: row.subject.id,
      code: row.subject.code,
      name: row.subject.name,
      department: row.subject.department,
      semester: row.subject.semester,
      defaultExpectedStudents: row.subject.defaultExpectedStudents,
      requiredEquipment: subjectRequiredEquipment,
      isActive: row.subject.isActive,
      createdAt: row.subject.createdAt.toISOString(),
      updatedAt: row.subject.updatedAt.toISOString(),
    },
    faculty: {
      id: row.faculty.id,
      employeeCode: row.faculty.employeeCode,
      fullName: row.faculty.fullName,
      department: row.faculty.department,
      email: row.faculty.email,
      phone: row.faculty.phone,
      designation: row.faculty.designation,
      isActive: row.faculty.isActive,
      createdAt: row.faculty.createdAt.toISOString(),
      updatedAt: row.faculty.updatedAt.toISOString(),
    },
    classroom: {
      id: row.classroom.id,
      code: row.classroom.code,
      name: row.classroom.name,
      building: row.classroom.building,
      capacity: row.classroom.capacity,
      roomType: row.classroom.roomType,
      equipment: classroomEquipment,
      isActive: row.classroom.isActive,
      notes: row.classroom.notes,
      createdAt: row.classroom.createdAt.toISOString(),
      updatedAt: row.classroom.updatedAt.toISOString(),
    },
  };
}

export const scheduleRepository = {
  async list(filters?: ScheduleFilter): Promise<ScheduleWithRelations[]> {
    const prisma = getPrisma();
    const where: any = {};

    if (filters?.dayOfWeek) {
      where.dayOfWeek = filters.dayOfWeek;
    }

    if (filters?.classroomId) {
      where.classroomId = filters.classroomId;
    }

    if (filters?.facultyId) {
      where.facultyId = filters.facultyId;
    }

    if (filters?.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { subject: { name: { contains: q, mode: 'insensitive' } } },
        { subject: { code: { contains: q, mode: 'insensitive' } } },
        { faculty: { fullName: { contains: q, mode: 'insensitive' } } },
        { classroom: { code: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const rows = await prisma.schedule.findMany({
      where,
      include: {
        subject: true,
        faculty: true,
        classroom: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return rows.map(formatScheduleWithRelations);
  },

  async getById(id: string): Promise<ScheduleWithRelations | null> {
    const prisma = getPrisma();
    const row = await prisma.schedule.findUnique({
      where: { id },
      include: {
        subject: true,
        faculty: true,
        classroom: true,
      },
    });
    return row ? formatScheduleWithRelations(row) : null;
  },

  async getDaySchedules(dayOfWeek: string): Promise<any[]> {
    const prisma = getPrisma();
    return prisma.schedule.findMany({
      where: { dayOfWeek },
      include: {
        subject: true,
        faculty: true,
        classroom: true,
      },
    });
  },

  async create(input: CreateScheduleInput): Promise<ScheduleWithRelations> {
    const prisma = getPrisma();
    const row = await prisma.schedule.create({
      data: {
        subjectId: input.subjectId,
        facultyId: input.facultyId,
        classroomId: input.classroomId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        expectedStudents: Number(input.expectedStudents),
        notes: input.notes?.trim() || null,
      },
      include: {
        subject: true,
        faculty: true,
        classroom: true,
      },
    });
    return formatScheduleWithRelations(row);
  },

  async update(id: string, input: UpdateScheduleInput): Promise<ScheduleWithRelations> {
    const prisma = getPrisma();
    const data: any = {};

    if (input.subjectId !== undefined) data.subjectId = input.subjectId;
    if (input.facultyId !== undefined) data.facultyId = input.facultyId;
    if (input.classroomId !== undefined) data.classroomId = input.classroomId;
    if (input.dayOfWeek !== undefined) data.dayOfWeek = input.dayOfWeek;
    if (input.startTime !== undefined) data.startTime = input.startTime;
    if (input.endTime !== undefined) data.endTime = input.endTime;
    if (input.expectedStudents !== undefined) data.expectedStudents = Number(input.expectedStudents);
    if (input.notes !== undefined) data.notes = input.notes?.trim() || null;

    const row = await prisma.schedule.update({
      where: { id },
      data,
      include: {
        subject: true,
        faculty: true,
        classroom: true,
      },
    });
    return formatScheduleWithRelations(row);
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const prisma = getPrisma();
    await prisma.schedule.delete({
      where: { id },
    });
    return { deleted: true, id };
  },
};
