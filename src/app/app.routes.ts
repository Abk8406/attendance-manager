import { Routes } from '@angular/router';
import { AttendanceTableComponent } from './attendance/attendance-table/attendance-table.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VendorsComponent } from './vendors/vendors.component';
import { EmployeesComponent } from './employees/employees.component';
import { LocationsComponent } from './locations/locations.component';
import { DevicesComponent } from './devices/devices.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { AttendanceWorkingComponent } from './attendance-working/attendance-working.component';
import { ReportComponent } from './report/report.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'attendance' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vendors', component: VendorsComponent },
  { path: 'attendance', component: AttendanceTableComponent },
  { path: 'employees', component: EmployeesComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'devices', component: DevicesComponent },
  { path: 'shifts', component: ShiftsComponent },
  { path: 'attendance-working', component: AttendanceWorkingComponent },
  { path: 'report', component: ReportComponent },
];
