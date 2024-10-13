import { IOrder } from '../types';
import { Form } from './common/Form';
import { IEvents } from './base/events';

export class Order extends Form<IOrder> {
	protected buttons: HTMLButtonElement[] = [];
	protected btnContainer: HTMLElement;

	constructor(
		protected container: HTMLFormElement,
		protected events: IEvents,
		protected actions?: {
			onClick: (name: string) => void;
		}
	) {
		super(container, events);

		this.btnContainer = this.container.querySelector('.order__buttons');
		this.buttons = [...this.btnContainer.querySelectorAll('button')];

		this.buttons.forEach((btn) => {
			btn.addEventListener('click', () => {
				actions?.onClick?.(btn.name);
				this.selectOption(btn.name);
			});
		});
	}

	selectOption(name: string) {
		this.buttons.forEach((btn) => {
			this.toggleClass(btn, 'button_alt-active', btn.name === name);
			this.setDisabled(btn, btn.name === name);
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	clearData() {
		this.buttons.forEach((btn) => {
			btn.classList.remove('button_alt-active');
			this.setDisabled(btn, false);
		});
	}
}
