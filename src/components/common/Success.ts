import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Success extends Component<{ infoPrice: number }> {
	protected info: HTMLElement;
	protected button: HTMLButtonElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);

		this.info = this.container.querySelector('.order-success__description');
		this.button = this.container.querySelector('.button');

		this.button.addEventListener('click', () => {
			this.events.emit('order:done');
		});
	}

	set infoPrice(value: string) {
		this.setText(this.info, `Списано ${value} синапсов.`);
	}
}
