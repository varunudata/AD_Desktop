import { DayOfWeek, RoomType } from '../types/models';

export const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'MONDAY', label: 'Monday', short: 'Mon' },
  { key: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { key: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { key: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { key: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { key: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { key: 'SUNDAY', label: 'Sunday', short: 'Sun' },
];

export const ROOM_TYPES: { key: RoomType; label: string; badgeColor: string }[] = [
  { key: 'LECTURE_HALL', label: 'Lecture Hall', badgeColor: 'blue' },
  { key: 'LABORATORY', label: 'Laboratory', badgeColor: 'cyan' },
  { key: 'SEMINAR_ROOM', label: 'Seminar Room', badgeColor: 'violet' },
  { key: 'CLASSROOM', label: 'Classroom', badgeColor: 'green' },
  { key: 'WORKSHOP', label: 'Workshop', badgeColor: 'amber' },
];

export const COMMON_EQUIPMENT = [
  'Dual 4K Projectors',
  'Ceiling Projector',
  'Smartboard 75"',
  'Wireless Mic & Audio System',
  'Standard Audio Amplification',
  'Whiteboard',
  '45 Linux Workstations',
  '40 Mac & PC Desktops',
  'Lab Optical Benches',
  'Oscilloscopes',
  'Lecture Recording Camera',
  'Podium PC',
  'Conference Video Bar',
];

export const SUBJECT_COLORS: string[] = [
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#16A34A', // Green
  '#D97706', // Amber
  '#E11D48', // Rose
  '#4F46E5', // Indigo
  '#0D9488', // Teal
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  institution_name: 'Apex Institute of Technology',
  academic_term: 'Fall 2026',
  working_days: JSON.stringify(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']),
  timetable_start_time: '08:00',
  timetable_end_time: '18:00',
  default_class_duration: '60',
  available_daily_teaching_hours: '10',
};
