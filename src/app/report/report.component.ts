import { Component } from '@angular/core';

@Component({
	selector: 'app-report',
	standalone: true,
	imports: [],
	template: `
		<div class="page">
			<h2>Report</h2>
			<p>Welcome to the report.</p>
		</div>
	`,
	styles: [
		`.page { padding: 16px; }`
	]
})
export class ReportComponent {}


