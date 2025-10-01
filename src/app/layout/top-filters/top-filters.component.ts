import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-top-filters',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatSelectModule, MatOptionModule, MatIconModule, MatButtonModule],
	templateUrl: './top-filters.component.html',
	styleUrls: ['./top-filters.component.scss']
})
export class TopFiltersComponent {
	vendors = ['Al Hekma', 'ACME'];
	employees = ['All Employees'];
	locations = ['LBR - S Plant', 'OUD Plant', 'LSS14'];
	months = ['Aug 2025', 'Sep 2025'];

	async onExport() {
		const table = document.querySelector('table.attendance') as HTMLTableElement | null;
		if (!table) return;
		const xlsx = await import('xlsx');
		const ws = xlsx.utils.table_to_sheet(table, { raw: true });
		const wb = xlsx.utils.book_new();
		xlsx.utils.book_append_sheet(wb, ws, 'Attendance');
		xlsx.writeFile(wb, `attendance_${new Date().toISOString().slice(0,10)}.xlsx`);
	}
}
