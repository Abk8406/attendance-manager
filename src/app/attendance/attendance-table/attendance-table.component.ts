import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Employee } from '../../models/employee';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

// Use dates 15–31 to align with DB.json structure
const DATE_RANGE = Array.from({ length: 17 }, (_, i) => (15 + i).toString());
const HH_MM_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

@Component({
	selector: 'app-attendance-table',
	standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatTooltipModule, NgxSpinnerModule],
	templateUrl: './attendance-table.component.html',
	styleUrls: ['./attendance-table.component.scss']
})
export class AttendanceTableComponent implements OnInit {
	readonly dates = DATE_RANGE;
	readonly hourlyRate = 20;
	employees: Employee[] = [];
	form: FormArray<FormGroup> = this.fb.array<FormGroup>([]);
	grandTotalPayableAed = 0;

	// Optional static employee counts per plant (when backend doesn't provide plants yet)
	private readonly staticPlantEmployeeCount: Record<string, number> = {
		'OUD Plant (LBP)': 2,
		'LSS14': 2
	};

	// Snapshot of totals that only updates on load and when user clicks Save
	private savedTotals: {
		vendor: { employees: number; hours: number; pay: number };
		plants: Record<string, { employees: number; hours: number; pay: number }>;
	} | null = null;

	constructor(private fb: FormBuilder, private api: ApiService, private snackBar: MatSnackBar, private spinner: NgxSpinnerService) { }

	ngOnInit(): void {
			this.spinner.show();
		this.api.getEmployees().subscribe({
			next: (emps) => {
				this.spinner.hide();
				this.employees = emps;
				this.buildForm();
				// Take initial snapshot for summaries
				this.snapshotTotals();
			},
			error: () => {
				this.spinner.hide();
				this.snackBar.open('Failed to load employees. Using mock data.', 'Close', { duration: 2500 });
			}
		});
	}

	get totalEmployees(): number { return this.form.length; }
	get totalWorkingHours(): number { return this.form.controls.reduce((s, fg: any) => s + (fg.get('totalHours')!.value || 0), 0); }
	get pricePerHour(): number { return this.hourlyRate; }

	private buildForm() {
		this.form.clear();
		for (const emp of this.employees) {
			const row = this.fb.group({
				id: emp.id,
				name: emp.name,
				empId: emp.empId,
				designation: emp.designation,
				attendance: this.fb.array(this.dates.map((d) => this.createDayGroup(emp.attendance?.[d]))),
				totalHours: new FormControl(0),
				totalPay: new FormControl(0)
			});
			this.form.push(row);
			this.registerRowEffects(row as FormGroup);
		}
		this.recalculateGrandTotal();
	}

	createDayGroup(day?: { hours: string; absent: boolean }) {
		const control = this.fb.group({
			hours: new FormControl(day?.hours ?? '08:00', [Validators.pattern(HH_MM_REGEX)]),
			absent: new FormControl(day?.absent ?? false)
		});
		// Apply initial disabled state based on absent
		if (control.get('absent')!.value) {
			control.get('hours')!.setValue('00:00', { emitEvent: false });
			control.get('hours')!.disable({ emitEvent: false });
		}
		// When absent toggles, enable/disable hours accordingly
		control.get('absent')!.valueChanges.subscribe((isAbsent) => {
			if (isAbsent) {
				control.get('hours')!.setValue('00:00');
				control.get('hours')!.disable({ emitEvent: false });
			} else {
				// Re-enable and restore default if empty
				control.get('hours')!.enable({ emitEvent: false });
				const current = control.get('hours')!.value as string;
				if (!current || current === '00:00') {
					control.get('hours')!.setValue('08:00');
				}
			}
		});

		// Auto-mark absent when hours become '00:00' or empty
		control.get('hours')!.valueChanges.subscribe((val) => {
			const value = (val || '').toString();
			const isZero = value === '00:00' || value.trim() === '';
			if (isZero && !control.get('absent')!.value) {
				control.get('absent')!.setValue(true);
			}
		});
		return control;
	}

	// --- Time input helpers to enforce HH:mm format while typing ---
	private digitsOnly(value: string): string {
		return (value || '').replace(/\D+/g, '');
	}

	private clamp(num: number, min: number, max: number): number {
		return Math.min(Math.max(num, min), max);
	}

	private formatToHHMMFromDigits(raw: string): string {
		const digits = this.digitsOnly(raw);
		if (!digits) return '';
		const four = digits.slice(-4).padStart(4, '0');
		// Hard limit: anything beyond 2359 becomes 23:59
		if (/^\d{4}$/.test(four) && parseInt(four, 10) > 2359) {
			return '23:59';
		}
		let hours = parseInt(four.slice(0, 2), 10);
		let mins = parseInt(four.slice(2, 4), 10);
		hours = this.clamp(isNaN(hours) ? 0 : hours, 0, 23);
		mins = this.clamp(isNaN(mins) ? 0 : mins, 0, 59);
		const hh = hours.toString().padStart(2, '0');
		const mm = mins.toString().padStart(2, '0');
		return `${hh}:${mm}`;
	}

	private autoFormatHours(dayGroup: FormGroup) {
		const ctrl = dayGroup.get('hours') as FormControl;
		const current = String(ctrl.value ?? '');
		const digits = this.digitsOnly(current);
		let formatted = '';
		if (digits.length === 0) {
			formatted = '';
		} else if (digits.length === 1) {
			const hh = this.clamp(parseInt(`0${digits}`, 10), 0, 23).toString().padStart(2, '0');
			formatted = `${hh}:00`;
		} else if (digits.length === 2) {
			const hh = this.clamp(parseInt(digits, 10), 0, 23).toString().padStart(2, '0');
			formatted = `${hh}:00`;
		} else if (digits.length === 3) {
			const hh = this.clamp(parseInt(`0${digits[0]}`, 10), 0, 23).toString().padStart(2, '0');
			const mm = this.clamp(parseInt(digits.slice(1, 3), 10), 0, 59).toString().padStart(2, '0');
			formatted = `${hh}:${mm}`;
		} else {
			formatted = this.formatToHHMMFromDigits(digits);
		}
		if (current !== formatted) ctrl.setValue(formatted, { emitEvent: false });
	}

    private normalizeHours(dayGroup: FormGroup) {
        const ctrl = dayGroup.get('hours') as FormControl;
        const current = String(ctrl.value ?? '');
        const formatted = this.formatToHHMMFromDigits(current);
        // Defer value write to next microtask to avoid NG0100 during the same change detection cycle
        Promise.resolve().then(() => {
            ctrl.setValue(formatted, { emitEvent: false });
            ctrl.markAsTouched();
            ctrl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });
    }

	onHoursInput(row: FormGroup, dayIndex: number) {
		const group = this.getAttendanceArray(row).at(dayIndex) as FormGroup;
		this.autoFormatHours(group);
	}

	onHoursBlur(row: FormGroup, dayIndex: number) {
		const group = this.getAttendanceArray(row).at(dayIndex) as FormGroup;
		this.normalizeHours(group);
	}

	onHoursKeydown(event: KeyboardEvent) {
		const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
		if (allowedKeys.includes(event.key)) return;
		if (!/\d/.test(event.key)) {
			event.preventDefault();
		}
	}

	markPresent(row: FormGroup, dayIndex: number) {
		const day = this.getAttendanceArray(row).at(dayIndex) as FormGroup;
		day.get('absent')!.setValue(false);
		day.get('hours')!.enable({ emitEvent: false });
		const current = day.get('hours')!.value as string;
		if (!current || current === '00:00') {
			day.get('hours')!.setValue('08:00');
		}
	}

	markAbsent(row: FormGroup, dayIndex: number) {
		const day = this.getAttendanceArray(row).at(dayIndex) as FormGroup;
		day.get('hours')!.setValue('00:00');
		day.get('absent')!.setValue(true);
		day.get('hours')!.disable({ emitEvent: false });
	}

	getAttendanceArray(row: FormGroup): FormArray<FormGroup> {
		return row.get('attendance') as FormArray<FormGroup>;
	}

	private registerRowEffects(row: FormGroup) {
		const att = this.getAttendanceArray(row);
		att.valueChanges.subscribe(() => {
			this.recalculateRow(row);
			this.recalculateGrandTotal();
		});
		this.recalculateRow(row);
	}

	private parseHoursToNumber(hhmm: string): number {
		if (!HH_MM_REGEX.test(hhmm)) return 0;
		const [hh, mm] = hhmm.split(':').map(Number);
		return hh + mm / 60;
	}

	private recalculateRow(row: FormGroup) {
		const att = this.getAttendanceArray(row).controls as FormGroup[];
		let totalHours = 0;
		for (const d of att) {
			const absent = d.get('absent')!.value as boolean;
			const hours = d.get('hours')!.value as string;
			if (!absent) totalHours += this.parseHoursToNumber(hours);
		}
		const rounded = Math.round(totalHours * 100) / 100; // two decimals
		row.get('totalHours')!.setValue(rounded, { emitEvent: false });
		row.get('totalPay')!.setValue(rounded * this.hourlyRate, { emitEvent: false });
	}

	private recalculateGrandTotal() {
		this.grandTotalPayableAed = this.form.controls.reduce((sum, fg: any) => sum + (fg.get('totalPay')!.value || 0), 0);
	}

	// Derived metrics used for plants when plant is not provided by API
	private getAverageHoursPerEmployee(): number {
		const rows = this.form.controls as unknown as FormGroup[];
		if (!rows.length) return 0;
		const total = rows.reduce((s, fg: any) => s + (fg.get('totalHours')?.value || 0), 0);
		return total / rows.length;
	}

	getPlantEmployees(plant: string): number {
		if (this.savedTotals) return this.savedTotals.plants[plant]?.employees ?? 0;
		if (plant === 'LBR - S Plant') return this.totalEmployees; // fallback before first snapshot
		return this.staticPlantEmployeeCount[plant] ?? 0;
	}

	getPlantHours(plant: string): number {
		if (this.savedTotals) return this.savedTotals.plants[plant]?.hours ?? 0;
		if (plant === 'LBR - S Plant') return this.totalWorkingHours; // fallback
		const avg = this.getAverageHoursPerEmployee();
		return this.getPlantEmployees(plant) * avg;
	}

	getPlantPay(plant: string): number {
		if (this.savedTotals) return this.savedTotals.plants[plant]?.pay ?? 0;
		return this.getPlantHours(plant) * this.pricePerHour;
	}

	// Vendor totals across all plants (LBR actual + others derived from static counts)
	get vendorEmployees(): number { return (this.savedTotals?.vendor.employees) ?? (this.getPlantEmployees('LBR - S Plant') + this.getPlantEmployees('OUD Plant (LBP)') + this.getPlantEmployees('LSS14')); }
	get vendorWorkingHours(): number { return (this.savedTotals?.vendor.hours) ?? (this.getPlantHours('LBR - S Plant') + this.getPlantHours('OUD Plant (LBP)') + this.getPlantHours('LSS14')); }
	get vendorTotalPay(): number { return (this.savedTotals?.vendor.pay) ?? (this.getPlantPay('LBR - S Plant') + this.getPlantPay('OUD Plant (LBP)') + this.getPlantPay('LSS14')); }

	private snapshotTotals() {
		// Compute snapshot based on current form values and static counts for plants without data
		const lbrEmployees = this.totalEmployees;
		const lbrHours = this.totalWorkingHours;
		const lbrPay = lbrHours * this.pricePerHour;
		const avg = this.getAverageHoursPerEmployee();
		const oudEmp = this.staticPlantEmployeeCount['OUD Plant (LBP)'] ?? 0;
		const lssEmp = this.staticPlantEmployeeCount['LSS14'] ?? 0;
		const oudHours = oudEmp * avg;
		const lssHours = lssEmp * avg;
		const oudPay = oudHours * this.pricePerHour;
		const lssPay = lssHours * this.pricePerHour;
		this.savedTotals = {
			vendor: {
				employees: lbrEmployees + oudEmp + lssEmp,
				hours: lbrHours + oudHours + lssHours,
				pay: lbrPay + oudPay + lssPay
			},
			plants: {
				'LBR - S Plant': { employees: lbrEmployees, hours: lbrHours, pay: lbrPay },
				'OUD Plant (LBP)': { employees: oudEmp, hours: oudHours, pay: oudPay },
				'LSS14': { employees: lssEmp, hours: lssHours, pay: lssPay }
			}
		};
	}

	onSave() {
		const payload = this.form.getRawValue();
		console.log('SAVE: Attendance table snapshot', payload);
		this.snackBar.open('Saved successfully', 'Close', { duration: 2500 });
		// Refresh snapshot so summaries reflect saved state only
		this.snapshotTotals();
	}

	onSubmit() {
		const payload = this.form.getRawValue();
		this.api.postAttendance(payload).subscribe((res) => {
			console.log('POST /attendance response:', res);
			this.snackBar.open('Attendance submitted successfully', 'Close', { duration: 2500 });
		});
	}

	async onExport() {
		const xlsx = await import('xlsx');
		const header = ['Employee Name', 'Emp ID', 'Designation', ...this.dates, 'Total Working Hour', 'Total Pay'];
		const rows: any[][] = [];
		for (const row of this.form.controls as unknown as FormGroup[]) {
			const name = row.get('name')!.value;
			const empId = row.get('empId')!.value;
			const designation = row.get('designation')!.value;
			const att = this.getAttendanceArray(row).controls as FormGroup[];
			const dayValues = att.map((d) => (d.get('absent')!.value ? 'Absent' : (d.get('hours')!.value || '')));
			const totalHours = row.get('totalHours')!.value;
			const totalPay = row.get('totalPay')!.value;
			rows.push([name, empId, designation, ...dayValues, totalHours, totalPay]);
		}
		const aoa = [header, ...rows];
		const ws = xlsx.utils.aoa_to_sheet(aoa);
		const wb = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Attendance');
		xlsx.writeFile(wb, `attendance_${new Date().toISOString().slice(0, 10)}.xlsx`);
		this.snackBar.open('Exported to Excel', 'Close', { duration: 2000 });
	}
}
