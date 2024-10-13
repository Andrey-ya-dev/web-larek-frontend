import { Component } from '../base/Component';

export class Loader extends Component<object> {
	constructor(protected container: HTMLElement) {
		super(container);
	}

	showLoader() {
		this.setVisible(this.container);
	}

	hideLoader() {
		this.setHidden(this.container);
	}
}
