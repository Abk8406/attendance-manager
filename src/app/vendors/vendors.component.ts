import { Component } from '@angular/core';

@Component({
	selector: 'app-vendors',
	standalone: true,
	imports: [],
	template: `
		<div class="page">
			<h2>Vendors</h2>
			<p>Default master page. Other master links will fall back here.</p>
		</div>
	`,
	styles: [
		`.page { padding: 16px; }`
	]
})
export class VendorsComponent {}


