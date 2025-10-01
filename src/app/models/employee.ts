export interface DayAttendance {
	hours: string; // HH:mm
	absent: boolean;
}

export interface Employee {
	id: number;
	name: string;
	empId: string;
	designation: string;
	hourlyRate: number;
	attendance: Record<string, DayAttendance>;
    plant?: string; // optional: plant/site assignment
}
