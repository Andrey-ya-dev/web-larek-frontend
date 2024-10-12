import { IOrder, TOrderField, TPaymentOption } from '../types';
import { Component } from './base/Component';
import { IEvents } from './base/events';

export class Order extends Component<{ option: string }> {
	protected orderButton: HTMLElement;
	protected orderInput: HTMLInputElement;
	// protected orderBtnCash: HTMLElement;
	// protected orderBtnCard: HTMLElement;
	protected orderForm: HTMLFormElement;
	protected orderContactForm: HTMLFormElement;
	protected _address = '';
	protected isOptionPicked = false;
	protected buttonList: HTMLElement;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);

		this.orderButton = this.container.querySelector('.order__button');
		this.orderInput = this.container.querySelector('input[name="address"]');
		// this.orderBtnCash = this.container.querySelector('button[name="cash"]');
		// this.orderBtnCard = this.container.querySelector('button[name="card"]');
		this.orderContactForm = this.container.querySelector(
			'form[name="contacts"]'
		);
		this.buttonList = this.container.querySelector('.order__buttons');

		// this.orderBtnCard.addEventListener('click', () => {
		// 	const option = this.getOption(this.orderBtnCard);
		// 	this.setOption(true);

		// 	this.events.emit('model:payment:select', {
		// 		payment: option,
		// 	});
		// });

		// this.orderBtnCash.addEventListener('click', () => {
		// 	this.setOption(true);

		// 	this.events.emit('model:payment:select', {
		// 		payment: this.orderBtnCash.getAttribute('name'),
		// 	});
		// });

		this.orderInput.addEventListener('input', () => {
			this.address = this.orderInput.value;
			this.events.emit('view:order:change');
		});

		this.container.addEventListener('submit', (e) => {
			e.preventDefault();
			if (this.validation()) {
				this.events.emit('model:order:submit', {
					name: this.orderInput.name,
					value: this.orderInput.value,
				});
				this.events.emit('view:contacts:open');
			}
		});
	}

	set address(value: string) {
		this._address = value;
	}

	get address() {
		return this._address;
	}

	setOption(value: boolean) {
		this.isOptionPicked = value;
	}

	validation() {
		if (this._address.length > 0 && this.isOptionPicked) {
			this.setDisabled(this.orderButton, false);
		} else {
			this.setDisabled(this.orderButton, true);
		}
		return this._address.length && this.isOptionPicked;
	}

	clearOrder() {
		this.orderInput.value = '';
		this.address = '';
		// this.orderBtnCash.classList.remove('button_alt-active');
		// this.orderBtnCard.classList.remove('button_alt-active');
		this.setOption(false);
		this.validation();
	}

	getOption(el: HTMLElement) {
		return el.getAttribute('name');
	}

	selectOption(name: TPaymentOption) {
		if (name === 'card') {
			// this.orderBtnCard.classList.add('button_alt-active');
			// this.orderBtnCash.classList.remove('button_alt-active');
			this.validation();
		} else {
			// this.orderBtnCard.classList.remove('button_alt-active');
			// this.orderBtnCash.classList.add('button_alt-active');
			this.validation();
		}
	}

	set tabs(buttons: HTMLElement) {
		this.buttonList.replaceChildren(buttons);
	}
}

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class _Form<T> extends Component<IFormState> {
	protected errorsContainer: HTMLElement;
	protected submitButton: HTMLButtonElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this.submitButton = this.container.querySelector('button[type="submit"]');
		this.errorsContainer = this.container.querySelector('.form__errors');

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const value = target.value;
			const targetName = target.name;
			this.onChangeInput(targetName, value);
		});

		this.container.addEventListener('submit', (e) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	onChangeInput(name: string, value: string) {
		this.events.emit(`${name}:change`, { value, name });
	}

	set valid(value: boolean) {
		this.submitButton.disabled = !value;
	}

	set errors(value: string) {
		this.setText(this.errorsContainer, value);
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

export class _Order extends _Form<IOrder> {
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

export class _Contacts extends _Form<{ phone: string; email: string }> {
	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}
}
