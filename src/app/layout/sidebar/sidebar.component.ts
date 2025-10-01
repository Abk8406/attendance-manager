import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
	collapsed = false;
	isMasterOpen = true;

	constructor() {
		this.setInitialState();
	}

	@HostListener('window:resize') onResize() { this.updateCollapsedForViewport(); }

	toggle() { this.collapsed = !this.collapsed; }
	toggleMaster() { this.isMasterOpen = !this.isMasterOpen; }

	// Collapse drawer after navigation on mobile
	onNavLinkClick() {
		if (window.innerWidth <= 992) {
			this.collapsed = true;
		}
	}

	private setInitialState() { this.collapsed = window.innerWidth <= 992; }
	private updateCollapsedForViewport() {
		if (window.innerWidth <= 992) this.collapsed = true;
		if (window.innerWidth > 992) this.collapsed = false;
	}
}
