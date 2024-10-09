import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Loader extends Component<object> {
	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);
	}

	showLoader() {
		this.container.style.display = 'flex';
		return this;
	}

	hideLoader() {
		this.container.style.display = 'none';
		return this;
	}
}
