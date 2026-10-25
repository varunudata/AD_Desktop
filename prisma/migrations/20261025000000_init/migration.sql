-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "building" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL DEFAULT 'CLASSROOM',
    "equipment" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT,
    "fullName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "designation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "semester" TEXT,
    "defaultExpectedStudents" INTEGER,
    "requiredEquipment" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "expectedStudents" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_code_key" ON "Classroom"("code");

-- CreateIndex
CREATE INDEX "Classroom_building_idx" ON "Classroom"("building");

-- CreateIndex
CREATE INDEX "Classroom_roomType_idx" ON "Classroom"("roomType");

-- CreateIndex
CREATE INDEX "Classroom_isActive_idx" ON "Classroom"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Faculty_employeeCode_key" ON "Faculty"("employeeCode");

-- CreateIndex
CREATE INDEX "Faculty_department_idx" ON "Faculty"("department");

-- CreateIndex
CREATE INDEX "Faculty_isActive_idx" ON "Faculty"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Subject_department_idx" ON "Subject"("department");

-- CreateIndex
CREATE INDEX "Subject_semester_idx" ON "Subject"("semester");

-- CreateIndex
CREATE INDEX "Subject_isActive_idx" ON "Subject"("isActive");

-- CreateIndex
CREATE INDEX "Schedule_classroomId_dayOfWeek_idx" ON "Schedule"("classroomId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Schedule_facultyId_dayOfWeek_idx" ON "Schedule"("facultyId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Schedule_subjectId_idx" ON "Schedule"("subjectId");

-- CreateIndex
CREATE INDEX "Schedule_dayOfWeek_idx" ON "Schedule"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_key_key" ON "Setting"("key");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
