import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log('Seeding ClassFlow PostgreSQL database...');

  // 1. Settings
  const defaultSettings = [
    { key: 'institution_name', value: 'Apex Institute of Technology' },
    { key: 'academic_term', value: 'Fall 2026' },
    { key: 'working_days', value: JSON.stringify(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']) },
    { key: 'timetable_start_time', value: '08:00' },
    { key: 'timetable_end_time', value: '18:00' },
    { key: 'default_class_duration', value: '60' },
    { key: 'available_daily_teaching_hours', value: '10' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 2. Classrooms
  const classroomsData = [
    {
      code: 'LH-101',
      name: 'Alan Turing Auditorium',
      building: 'Main Academic Wing',
      capacity: 120,
      roomType: 'LECTURE_HALL',
      equipment: JSON.stringify(['Dual 4K Projectors', 'Wireless Mic & Audio System', 'Lecture Recording Camera', 'Podium PC']),
      isActive: true,
      notes: 'Tiered auditorium for large common lectures and guest talks.',
    },
    {
      code: 'CS-LAB-1',
      name: 'Systems & Networks Laboratory',
      building: 'Turing Technology Center',
      capacity: 45,
      roomType: 'LABORATORY',
      equipment: JSON.stringify(['45 Linux Workstations', 'Ceiling Projector', 'Gigabit Switch Rack', 'Whiteboard']),
      isActive: true,
      notes: 'Dedicated for Systems Programming, OS, and Networking practicals.',
    },
    {
      code: 'CS-LAB-2',
      name: 'Software Engineering Studio',
      building: 'Turing Technology Center',
      capacity: 40,
      roomType: 'LABORATORY',
      equipment: JSON.stringify(['40 Mac & PC Desktops', 'Smartboard 75"', 'High-speed Fiber Uplink']),
      isActive: true,
      notes: 'Configured for Web/Mobile App Dev, Database Systems, and UI/UX design.',
    },
    {
      code: 'SEM-204',
      name: 'Executive Seminar Room',
      building: 'Main Academic Wing',
      capacity: 35,
      roomType: 'SEMINAR_ROOM',
      equipment: JSON.stringify(['Conference Video Bar', 'Motorized Screen', 'Interactive Display']),
      isActive: true,
      notes: 'Roundtable seating for seminars, capstone presentations, and electives.',
    },
    {
      code: 'CR-302',
      name: 'General Classroom 302',
      building: 'Science & Humanities Block',
      capacity: 65,
      roomType: 'CLASSROOM',
      equipment: JSON.stringify(['Overhead Projector', 'Standard Audio Amplification', 'Whiteboard']),
      isActive: true,
      notes: 'Standard classroom with modular student desks.',
    },
    {
      code: 'PHY-LAB',
      name: 'Optics & Electronics Lab',
      building: 'Science & Humanities Block',
      capacity: 30,
      roomType: 'LABORATORY',
      equipment: JSON.stringify(['Lab Optical Benches', 'Oscilloscopes', 'Safety Eyewash Station']),
      isActive: true,
      notes: 'Undergraduate physics and hardware experiments.',
    },
  ];

  const classrooms: Record<string, string> = {};
  for (const c of classroomsData) {
    const record = await prisma.classroom.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    classrooms[record.code] = record.id;
  }

  // 3. Faculty Members
  const facultyData = [
    {
      employeeCode: 'FAC-CS-01',
      fullName: 'Dr. Ada Lovelace',
      department: 'Computer Science',
      email: 'a.lovelace@apex.edu',
      phone: '+1 (555) 234-5671',
      designation: 'Professor & Department Chair',
      isActive: true,
    },
    {
      employeeCode: 'FAC-CS-02',
      fullName: 'Dr. Claude Shannon',
      department: 'Computer Science',
      email: 'c.shannon@apex.edu',
      phone: '+1 (555) 234-5672',
      designation: 'Associate Professor',
      isActive: true,
    },
    {
      employeeCode: 'FAC-CS-03',
      fullName: 'Prof. Grace Hopper',
      department: 'Computer Science',
      email: 'g.hopper@apex.edu',
      phone: '+1 (555) 234-5673',
      designation: 'Assistant Professor',
      isActive: true,
    },
    {
      employeeCode: 'FAC-MATH-01',
      fullName: 'Dr. Srinivasa Ramanujan',
      department: 'Mathematics',
      email: 's.ramanujan@apex.edu',
      phone: '+1 (555) 234-5674',
      designation: 'Distinguished Professor',
      isActive: true,
    },
    {
      employeeCode: 'FAC-PHY-01',
      fullName: 'Dr. Marie Curie',
      department: 'Physics',
      email: 'm.curie@apex.edu',
      phone: '+1 (555) 234-5675',
      designation: 'Professor',
      isActive: true,
    },
    {
      employeeCode: 'FAC-EE-01',
      fullName: 'Prof. Nikola Tesla',
      department: 'Electrical Engineering',
      email: 'n.tesla@apex.edu',
      phone: '+1 (555) 234-5676',
      designation: 'Associate Professor',
      isActive: true,
    },
  ];

  const faculty: Record<string, string> = {};
  for (const f of facultyData) {
    const record = await prisma.faculty.upsert({
      where: { employeeCode: f.employeeCode },
      update: f,
      create: f,
    });
    if (record.employeeCode) {
      faculty[record.employeeCode] = record.id;
    }
  }

  // 4. Subjects
  const subjectsData = [
    {
      code: 'CS-301',
      name: 'Database Management Systems',
      department: 'Computer Science',
      semester: 'Semester 5',
      defaultExpectedStudents: 42,
      requiredEquipment: JSON.stringify(['Ceiling Projector']),
      isActive: true,
    },
    {
      code: 'CS-302',
      name: 'Operating Systems & Concurrency',
      department: 'Computer Science',
      semester: 'Semester 5',
      defaultExpectedStudents: 40,
      requiredEquipment: JSON.stringify(['45 Linux Workstations']),
      isActive: true,
    },
    {
      code: 'CS-401',
      name: 'Distributed Systems & Cloud Architecture',
      department: 'Computer Science',
      semester: 'Semester 7',
      defaultExpectedStudents: 32,
      requiredEquipment: JSON.stringify(['Smartboard 75"']),
      isActive: true,
    },
    {
      code: 'MATH-201',
      name: 'Discrete Mathematics & Graph Theory',
      department: 'Mathematics',
      semester: 'Semester 3',
      defaultExpectedStudents: 60,
      requiredEquipment: JSON.stringify(['Whiteboard', 'Overhead Projector']),
      isActive: true,
    },
    {
      code: 'PHY-102',
      name: 'Quantum Optics & Solid State Physics',
      department: 'Physics',
      semester: 'Semester 2',
      defaultExpectedStudents: 28,
      requiredEquipment: JSON.stringify(['Lab Optical Benches']),
      isActive: true,
    },
    {
      code: 'EE-205',
      name: 'Digital Signals & Microcontrollers',
      department: 'Electrical Engineering',
      semester: 'Semester 4',
      defaultExpectedStudents: 30,
      requiredEquipment: JSON.stringify(['Oscilloscopes']),
      isActive: true,
    },
  ];

  const subjects: Record<string, string> = {};
  for (const sub of subjectsData) {
    const record = await prisma.subject.upsert({
      where: { code: sub.code },
      update: sub,
      create: sub,
    });
    subjects[record.code] = record.id;
  }

  // 5. Schedules (Carefully planned with NO conflicts)
  // Clean existing sample schedules to allow clean re-seeding
  await prisma.schedule.deleteMany({});

  const schedulesData = [
    // Monday
    {
      subjectId: subjects['CS-301'],
      facultyId: faculty['FAC-CS-01'],
      classroomId: classrooms['CR-302'],
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:30',
      expectedStudents: 42,
      notes: 'Lecture on Relational Algebra and Query Optimization.',
    },
    {
      subjectId: subjects['CS-302'],
      facultyId: faculty['FAC-CS-02'],
      classroomId: classrooms['CS-LAB-1'],
      dayOfWeek: 'MONDAY',
      startTime: '10:45',
      endTime: '12:45',
      expectedStudents: 40,
      notes: 'Kernel synchronization & multi-threading lab practical.',
    },
    {
      subjectId: subjects['MATH-201'],
      facultyId: faculty['FAC-MATH-01'],
      classroomId: classrooms['LH-101'],
      dayOfWeek: 'MONDAY',
      startTime: '14:00',
      endTime: '15:30',
      expectedStudents: 60,
      notes: 'Graph isomorphism and tree traversal proofs.',
    },

    // Tuesday
    {
      subjectId: subjects['CS-401'],
      facultyId: faculty['FAC-CS-03'],
      classroomId: classrooms['SEM-204'],
      dayOfWeek: 'TUESDAY',
      startTime: '09:30',
      endTime: '11:00',
      expectedStudents: 32,
      notes: 'Raft consensus & Byzantine fault tolerance.',
    },
    {
      subjectId: subjects['PHY-102'],
      facultyId: faculty['FAC-PHY-01'],
      classroomId: classrooms['PHY-LAB'],
      dayOfWeek: 'TUESDAY',
      startTime: '11:15',
      endTime: '13:15',
      expectedStudents: 28,
      notes: 'Laser interferometry laboratory experiment.',
    },
    {
      subjectId: subjects['CS-301'],
      facultyId: faculty['FAC-CS-01'],
      classroomId: classrooms['CS-LAB-2'],
      dayOfWeek: 'TUESDAY',
      startTime: '14:30',
      endTime: '16:00',
      expectedStudents: 38,
      notes: 'PostgreSQL indexing and EXPLAIN ANALYZE workshop.',
    },

    // Wednesday
    {
      subjectId: subjects['MATH-201'],
      facultyId: faculty['FAC-MATH-01'],
      classroomId: classrooms['LH-101'],
      dayOfWeek: 'WEDNESDAY',
      startTime: '09:00',
      endTime: '10:30',
      expectedStudents: 60,
      notes: 'Combinatorics and recurrence relations.',
    },
    {
      subjectId: subjects['EE-205'],
      facultyId: faculty['FAC-EE-01'],
      classroomId: classrooms['PHY-LAB'],
      dayOfWeek: 'WEDNESDAY',
      startTime: '11:00',
      endTime: '12:30',
      expectedStudents: 30,
      notes: 'ARM Cortex timer interrupts and GPIO programming.',
    },
    {
      subjectId: subjects['CS-302'],
      facultyId: faculty['FAC-CS-02'],
      classroomId: classrooms['CR-302'],
      dayOfWeek: 'WEDNESDAY',
      startTime: '14:00',
      endTime: '15:30',
      expectedStudents: 40,
      notes: 'Virtual memory paging and page replacement algorithms.',
    },

    // Thursday
    {
      subjectId: subjects['CS-401'],
      facultyId: faculty['FAC-CS-03'],
      classroomId: classrooms['SEM-204'],
      dayOfWeek: 'THURSDAY',
      startTime: '10:00',
      endTime: '11:30',
      expectedStudents: 32,
      notes: 'Microservices event streaming with Apache Kafka.',
    },
    {
      subjectId: subjects['EE-205'],
      facultyId: faculty['FAC-EE-01'],
      classroomId: classrooms['CR-302'],
      dayOfWeek: 'THURSDAY',
      startTime: '13:30',
      endTime: '15:00',
      expectedStudents: 30,
      notes: 'Signal filtering & Fast Fourier Transform overview.',
    },

    // Friday
    {
      subjectId: subjects['CS-301'],
      facultyId: faculty['FAC-CS-01'],
      classroomId: classrooms['CR-302'],
      dayOfWeek: 'FRIDAY',
      startTime: '09:30',
      endTime: '11:00',
      expectedStudents: 42,
      notes: 'ACID properties and Distributed Transactions.',
    },
    {
      subjectId: subjects['PHY-102'],
      facultyId: faculty['FAC-PHY-01'],
      classroomId: classrooms['LH-101'],
      dayOfWeek: 'FRIDAY',
      startTime: '11:30',
      endTime: '13:00',
      expectedStudents: 28,
      notes: 'Introduction to Semiconductor Bandgaps and Diodes.',
    },
    {
      subjectId: subjects['CS-302'],
      facultyId: faculty['FAC-CS-02'],
      classroomId: classrooms['CS-LAB-1'],
      dayOfWeek: 'FRIDAY',
      startTime: '14:00',
      endTime: '16:00',
      expectedStudents: 40,
      notes: 'File systems implementation and inode table indexing.',
    },
  ];

  for (const item of schedulesData) {
    await prisma.schedule.create({ data: item });
  }

  console.log('ClassFlow seed data successfully populated.');
}

if (require.main === module) {
  seedDatabase()
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
