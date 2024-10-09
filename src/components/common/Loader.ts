import { Component } from '../base/Component';

export class Loader extends Component<object> {
	constructor(protected container: HTMLElement) {
		super(container);
	}

	showLoader() {
		console.log('show');
		this.container.style.display = 'flex';
	}

	hideLoader() {
		this.container.style.display = 'none';
	}
}
