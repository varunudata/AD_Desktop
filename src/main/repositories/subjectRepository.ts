import { getPrisma } from '../database/prisma';
import { Subject } from '../../shared/types/models';
import { SubjectFilter } from '../../shared/types/ipc';
import { CreateSubjectInput, UpdateSubjectInput } from '../../shared/types/api';

function formatSubject(row: any): Subject {
  let requiredEquipment: string[] = [];
  try {
    requiredEquipment = JSON.parse(row.requiredEquipment || '[]');
  } catch {
    requiredEquipment = [];
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    department: row.department,
    semester: row.semester,
    defaultExpectedStudents: row.defaultExpectedStudents,
    requiredEquipment,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const subjectRepository = {
  async list(filters?: SubjectFilter): Promise<Subject[]> {
    const prisma = getPrisma();
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.department) {
      where.department = { contains: filters.department, mode: 'insensitive' };
    }

    if (filters?.semester) {
      where.semester = { contains: filters.semester, mode: 'insensitive' };
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { code: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.subject.findMany({
      where,
      orderBy: [{ department: 'asc' }, { code: 'asc' }],
    });

    return rows.map(formatSubject);
  },

  async getById(id: string): Promise<Subject | null> {
    const prisma = getPrisma();
    const row = await prisma.subject.findUnique({ where: { id } });
    return row ? formatSubject(row) : null;
  },

  async getByCode(code: string): Promise<Subject | null> {
    const prisma = getPrisma();
    const row = await prisma.subject.findUnique({ where: { code } });
    return row ? formatSubject(row) : null;
  },

  async create(input: CreateSubjectInput): Promise<Subject> {
    const prisma = getPrisma();
    const row = await prisma.subject.create({
      data: {
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        department: input.department.trim(),
        semester: input.semester?.trim() || null,
        defaultExpectedStudents: input.defaultExpectedStudents ? Number(input.defaultExpectedStudents) : null,
        requiredEquipment: JSON.stringify(input.requiredEquipment || []),
        isActive: input.isActive ?? true,
      },
    });
    return formatSubject(row);
  },

  async update(id: string, input: UpdateSubjectInput): Promise<Subject> {
    const prisma = getPrisma();
    const data: any = {};

    if (input.code !== undefined) data.code = input.code.trim().toUpperCase();
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.department !== undefined) data.department = input.department.trim();
    if (input.semester !== undefined) data.semester = input.semester?.trim() || null;
    if (input.defaultExpectedStudents !== undefined) {
      data.defaultExpectedStudents = input.defaultExpectedStudents ? Number(input.defaultExpectedStudents) : null;
    }
    if (input.requiredEquipment !== undefined) {
      data.requiredEquipment = JSON.stringify(input.requiredEquipment);
    }
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const row = await prisma.subject.update({
      where: { id },
      data,
    });
    return formatSubject(row);
  },

  async countSchedules(subjectId: string): Promise<number> {
    const prisma = getPrisma();
    return prisma.schedule.count({
      where: { subjectId },
    });
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const prisma = getPrisma();
    await prisma.subject.delete({
      where: { id },
    });
    return { deleted: true, id };
  },
};
