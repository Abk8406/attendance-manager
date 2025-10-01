import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TopFiltersComponent } from './layout/top-filters/top-filters.component';
import { AttendanceTableComponent } from './attendance/attendance-table/attendance-table.component';
import { AttendanceWorkingComponent } from './attendance-working/attendance-working.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopFiltersComponent, AttendanceTableComponent, AttendanceWorkingComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'attendance-manager';
}
