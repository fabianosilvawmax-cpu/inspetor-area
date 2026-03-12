export interface LoggedIssue {
  id: string;
  type: string;
  timestamp: number;
  location: { lat: number; lon: number } | null;
  streetName?: string;
  photo?: string | null;
  observation?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
}

export interface InspectionState {
  id: string;
  technicianName: string;
  date: string; // ISO date string
  activityType: string;
  targetDistance: number; // in km
  traveledDistance: number; // in km
  isActive: boolean;
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  lastPosition: { lat: number; lon: number } | null;
  currentStreet: string;
  path: { lat: number; lon: number; timestamp: number }[];
  issues: LoggedIssue[];
  photos: string[];
}

export interface Activity {
  name: string;
  target: number;
}
