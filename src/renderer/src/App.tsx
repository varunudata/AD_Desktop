import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { NavPage } from './components/layout/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { TimetablePage } from './pages/TimetablePage';
import { ClassroomsPage } from './pages/ClassroomsPage';
import { FacultyPage } from './pages/FacultyPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ClassroomModal } from './features/classrooms/ClassroomModal';
import { FacultyModal } from './features/faculty/FacultyModal';
import { SubjectModal } from './features/subjects/SubjectModal';
import { ScheduleModal } from './features/timetable/ScheduleModal';
import { ScheduleDetailModal } from './features/timetable/ScheduleDetailModal';
import { FacultyScheduleModal } from './features/faculty/FacultyScheduleModal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { useDatabaseStatus } from './hooks/useDatabaseStatus';
import { useToast } from './components/ui/Toast';
import {
  Classroom,
  Faculty,
  Subject,
  ScheduleWithRelations,
  DayOfWeek,
} from '../../shared/types/models';

export const App: React.FC = () => {
  const toast = useToast();
  const { status: dbStatus, refreshStatus: refreshDbStatus } = useDatabaseStatus();

  const [currentPage, setCurrentPage] = useState<NavPage>('overview');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core Data Collections
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<ScheduleWithRelations[]>([]);

  // Modals state
  const [classroomModalOpen, setClassroomModalOpen] = useState(false);
  const [classroomToEdit, setClassroomToEdit] = useState<Classroom | null>(null);

  const [facultyModalOpen, setFacultyModalOpen] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState<Faculty | null>(null);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleWithRelations | null>(null);
  const [scheduleInitialDay, setScheduleInitialDay] = useState<DayOfWeek | undefined>(undefined);
  const [scheduleInitialTime, setScheduleInitialTime] = useState<string | undefined>(undefined);

  const [scheduleDetailOpen, setScheduleDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithRelations | null>(null);

  const [facultyScheduleOpen, setFacultyScheduleOpen] = useState(false);
  const [selectedFacultyForSchedule, setSelectedFacultyForSchedule] = useState<Faculty | null>(null);

  // Destructive delete confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'classroom' | 'faculty' | 'subject' | 'schedule';
    id: string;
    title: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all domain data
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (window.classflowAPI) {
        const [cRes, fRes, sRes, schRes] = await Promise.all([
          window.classflowAPI.classrooms.list(),
          window.classflowAPI.faculty.list(),
          window.classflowAPI.subjects.list(),
          window.classflowAPI.schedules.list(),
        ]);

        if (cRes.success) setClassrooms(cRes.data);
        if (fRes.success) setFacultyList(fRes.data);
        if (sRes.success) setSubjects(sRes.data);
        if (schRes.success) setSchedules(schRes.data);
      }
    } catch (err: unknown) {
      console.error('Data fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleRefreshAll = () => {
    setRefreshTrigger((prev) => prev + 1);
    refreshDbStatus();
  };

  // Quick Action button handler in TopBar
  const handleTopBarQuickAction = () => {
    if (currentPage === 'classrooms') {
      setClassroomToEdit(null);
      setClassroomModalOpen(true);
    } else if (currentPage === 'faculty') {
      setFacultyToEdit(null);
      setFacultyModalOpen(true);
    } else if (currentPage === 'subjects') {
      setSubjectToEdit(null);
      setSubjectModalOpen(true);
    } else {
      // Default: Schedule class
      setScheduleToEdit(null);
      setScheduleInitialDay(undefined);
      setScheduleInitialTime(undefined);
      setScheduleModalOpen(true);
    }
  };

  // Delete Action Trigger
  const executeDelete = async () => {
    if (!deleteTarget) return;
    if (!window.classflowAPI) {
      toast.error('ClassFlow desktop bridge is unavailable. Please restart the application.');
      return;
    }
    setIsDeleting(true);

    try {
      let res;
      if (deleteTarget.type === 'classroom') {
        res = await window.classflowAPI.classrooms.delete(deleteTarget.id);
      } else if (deleteTarget.type === 'faculty') {
        res = await window.classflowAPI.faculty.delete(deleteTarget.id);
      } else if (deleteTarget.type === 'subject') {
        res = await window.classflowAPI.subjects.delete(deleteTarget.id);
      } else if (deleteTarget.type === 'schedule') {
        res = await window.classflowAPI.schedules.delete(deleteTarget.id);
      }

      if (res && res.success) {
        toast.success(`${deleteTarget.title} deleted successfully.`);
        setConfirmDeleteOpen(false);
        setDeleteTarget(null);
        handleRefreshAll();
      } else if (res && !res.success) {
        toast.error(res.error.message);
      }
    } catch (err: unknown) {
      toast.error('Failed to complete delete operation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onQuickAction={handleTopBarQuickAction}
      onRefresh={handleRefreshAll}
      isRefreshing={isRefreshing}
      dbStatus={dbStatus}
      onDbRefresh={refreshDbStatus}
    >
      {currentPage === 'overview' && (
        <OverviewPage
          onNavigate={setCurrentPage}
          onOpenScheduleModal={() => {
            setScheduleToEdit(null);
            setScheduleModalOpen(true);
          }}
          onOpenClassroomModal={() => {
            setClassroomToEdit(null);
            setClassroomModalOpen(true);
          }}
          onOpenFacultyModal={() => {
            setFacultyToEdit(null);
            setFacultyModalOpen(true);
          }}
          onOpenSubjectModal={() => {
            setSubjectToEdit(null);
            setSubjectModalOpen(true);
          }}
          onSelectSchedule={(s) => {
            setSelectedSchedule(s);
            setScheduleDetailOpen(true);
          }}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentPage === 'timetable' && (
        <TimetablePage
          schedules={schedules}
          classrooms={classrooms}
          facultyList={facultyList}
          subjects={subjects}
          onOpenScheduleModal={(day, time) => {
            setScheduleToEdit(null);
            setScheduleInitialDay(day);
            setScheduleInitialTime(time);
            setScheduleModalOpen(true);
          }}
          onSelectSchedule={(s) => {
            setSelectedSchedule(s);
            setScheduleDetailOpen(true);
          }}
          isLoading={isRefreshing}
        />
      )}

      {currentPage === 'classrooms' && (
        <ClassroomsPage
          classrooms={classrooms}
          onOpenCreateModal={() => {
            setClassroomToEdit(null);
            setClassroomModalOpen(true);
          }}
          onOpenEditModal={(c) => {
            setClassroomToEdit(c);
            setClassroomModalOpen(true);
          }}
          onRequestDelete={(c) => {
            setDeleteTarget({
              type: 'classroom',
              id: c.id,
              title: 'Classroom',
              name: `${c.code} (${c.name})`,
            });
            setConfirmDeleteOpen(true);
          }}
        />
      )}

      {currentPage === 'faculty' && (
        <FacultyPage
          facultyList={facultyList}
          schedules={schedules}
          onOpenCreateModal={() => {
            setFacultyToEdit(null);
            setFacultyModalOpen(true);
          }}
          onOpenEditModal={(f) => {
            setFacultyToEdit(f);
            setFacultyModalOpen(true);
          }}
          onRequestDelete={(f) => {
            setDeleteTarget({
              type: 'faculty',
              id: f.id,
              title: 'Faculty Member',
              name: f.fullName,
            });
            setConfirmDeleteOpen(true);
          }}
          onViewSchedule={(f) => {
            setSelectedFacultyForSchedule(f);
            setFacultyScheduleOpen(true);
          }}
        />
      )}

      {currentPage === 'subjects' && (
        <SubjectsPage
          subjects={subjects}
          schedules={schedules}
          onOpenCreateModal={() => {
            setSubjectToEdit(null);
            setSubjectModalOpen(true);
          }}
          onOpenEditModal={(sub) => {
            setSubjectToEdit(sub);
            setSubjectModalOpen(true);
          }}
          onRequestDelete={(sub) => {
            setDeleteTarget({
              type: 'subject',
              id: sub.id,
              title: 'Subject',
              name: `${sub.code} — ${sub.name}`,
            });
            setConfirmDeleteOpen(true);
          }}
        />
      )}

      {currentPage === 'reports' && (
        <ReportsPage refreshTrigger={refreshTrigger} />
      )}

      {currentPage === 'settings' && (
        <SettingsPage
          dbStatus={dbStatus}
          onRefreshDbStatus={refreshDbStatus}
          onDataChanged={handleRefreshAll}
        />
      )}

      {/* Classroom Modal */}
      <ClassroomModal
        isOpen={classroomModalOpen}
        onClose={() => setClassroomModalOpen(false)}
        classroomToEdit={classroomToEdit}
        onSuccess={handleRefreshAll}
      />

      {/* Faculty Modal */}
      <FacultyModal
        isOpen={facultyModalOpen}
        onClose={() => setFacultyModalOpen(false)}
        facultyToEdit={facultyToEdit}
        onSuccess={handleRefreshAll}
      />

      {/* Subject Modal */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        subjectToEdit={subjectToEdit}
        onSuccess={handleRefreshAll}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        scheduleToEdit={scheduleToEdit}
        initialDay={scheduleInitialDay}
        initialTime={scheduleInitialTime}
        classrooms={classrooms.filter((c) => c.isActive)}
        facultyList={facultyList.filter((f) => f.isActive)}
        subjects={subjects.filter((s) => s.isActive)}
        onSuccess={handleRefreshAll}
      />

      {/* Schedule Detail Modal */}
      <ScheduleDetailModal
        isOpen={scheduleDetailOpen}
        onClose={() => {
          setScheduleDetailOpen(false);
          setSelectedSchedule(null);
        }}
        schedule={selectedSchedule}
        onEdit={(s) => {
          setScheduleDetailOpen(false);
          setScheduleToEdit(s);
          setScheduleModalOpen(true);
        }}
        onDelete={(s) => {
          setScheduleDetailOpen(false);
          setDeleteTarget({
            type: 'schedule',
            id: s.id,
            title: 'Schedule Booking',
            name: `${s.subject.name} on ${s.dayOfWeek} at ${s.startTime}`,
          });
          setConfirmDeleteOpen(true);
        }}
      />

      {/* Faculty Schedule Modal */}
      <FacultyScheduleModal
        isOpen={facultyScheduleOpen}
        onClose={() => {
          setFacultyScheduleOpen(false);
          setSelectedFacultyForSchedule(null);
        }}
        faculty={selectedFacultyForSchedule}
        schedules={schedules}
      />

      {/* Destructive Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title={`Delete ${deleteTarget?.title}?`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? If there are active classes or dependencies, this will be prevented to protect timetable integrity.`}
        confirmLabel="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={executeDelete}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setDeleteTarget(null);
        }}
      />
    </AppLayout>
  );
};
