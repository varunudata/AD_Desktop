import { getPrisma } from '../database/prisma';
import { Faculty } from '../../shared/types/models';
import { FacultyFilter } from '../../shared/types/ipc';
import { CreateFacultyInput, UpdateFacultyInput } from '../../shared/types/api';

function formatFaculty(row: any): Faculty {
  return {
    id: row.id,
    employeeCode: row.employeeCode,
    fullName: row.fullName,
    department: row.department,
    email: row.email,
    phone: row.phone,
    designation: row.designation,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export const facultyRepository = {
  async list(filters?: FacultyFilter): Promise<Faculty[]> {
    const prisma = getPrisma();
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.department) {
      where.department = { contains: filters.department, mode: 'insensitive' };
    }

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: 'insensitive' } },
        { employeeCode: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await prisma.faculty.findMany({
      where,
      orderBy: [{ department: 'asc' }, { fullName: 'asc' }],
    });

    return rows.map(formatFaculty);
  },

  async getById(id: string): Promise<Faculty | null> {
    const prisma = getPrisma();
    const row = await prisma.faculty.findUnique({ where: { id } });
    return row ? formatFaculty(row) : null;
  },

  async create(input: CreateFacultyInput): Promise<Faculty> {
    const prisma = getPrisma();
    const row = await prisma.faculty.create({
      data: {
        employeeCode: input.employeeCode?.trim() || null,
        fullName: input.fullName.trim(),
        department: input.department.trim(),
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        designation: input.designation?.trim() || null,
        isActive: input.isActive ?? true,
      },
    });
    return formatFaculty(row);
  },

  async update(id: string, input: UpdateFacultyInput): Promise<Faculty> {
    const prisma = getPrisma();
    const data: any = {};

    if (input.employeeCode !== undefined) data.employeeCode = input.employeeCode?.trim() || null;
    if (input.fullName !== undefined) data.fullName = input.fullName.trim();
    if (input.department !== undefined) data.department = input.department.trim();
    if (input.email !== undefined) data.email = input.email?.trim() || null;
    if (input.phone !== undefined) data.phone = input.phone?.trim() || null;
    if (input.designation !== undefined) data.designation = input.designation?.trim() || null;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const row = await prisma.faculty.update({
      where: { id },
      data,
    });
    return formatFaculty(row);
  },

  async countSchedules(facultyId: string): Promise<number> {
    const prisma = getPrisma();
    return prisma.schedule.count({
      where: { facultyId },
    });
  },

  async delete(id: string): Promise<{ deleted: boolean; id: string }> {
    const prisma = getPrisma();
    await prisma.faculty.delete({
      where: { id },
    });
    return { deleted: true, id };
  },
};
