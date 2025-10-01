import { Component } from '@angular/core';

@Component({
	selector: 'app-dashboard',
	standalone: true,
	imports: [],
	template: `
		<div class="page">
			<h2>Dashboard</h2>
			<p>Welcome to the dashboard.</p>
		</div>
	`,
	styles: [
		`.page { padding: 16px; }`
	]
})
export class DashboardComponent {}


