import { TPaymentOption } from '../types';
import { Component } from './base/Component';
import { IEvents } from './base/events';

export class Order extends Component<{ option: string }> {
	protected orderButton: HTMLElement;
	protected orderInput: HTMLInputElement;
	protected orderBtnCash: HTMLElement;
	protected orderBtnCard: HTMLElement;
	protected orderForm: HTMLFormElement;
	protected orderContactForm: HTMLFormElement;
	protected _address = '';
	protected isOptionPicked = false;

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);

		this.orderButton = this.container.querySelector('.order__button');
		this.orderInput = this.container.querySelector('input[name="address"]');
		this.orderBtnCash = this.container.querySelector('button[name="cash"]');
		this.orderBtnCard = this.container.querySelector('button[name="card"]');
		this.orderContactForm = this.container.querySelector(
			'form[name="contacts"]'
		);

		// console.log(this.orderForm, this.container, ' order form');

		this.orderBtnCard.addEventListener('click', () => {
			const option = this.getOption(this.orderBtnCard);
			this.setOption(true);

			this.events.emit('model:payment:select', {
				payment: option,
			});
			this.events.emit('model:order:change');
		});

		this.orderBtnCash.addEventListener('click', () => {
			this.setOption(true);

			this.events.emit('model:payment:select', {
				payment: this.orderBtnCash.getAttribute('name'),
			});
			this.events.emit('model:order:change');
		});

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
		this.orderBtnCash.classList.remove('button_alt-active');
		this.orderBtnCard.classList.remove('button_alt-active');
		this.validation();
	}

	getOption(el: HTMLElement) {
		return el.getAttribute('name');
	}

	selectOption(name: TPaymentOption) {
		if (name === 'card') {
			this.orderBtnCard.classList.add('button_alt-active');
			this.orderBtnCash.classList.remove('button_alt-active');
			this.validation();
		} else {
			this.orderBtnCard.classList.remove('button_alt-active');
			this.orderBtnCash.classList.add('button_alt-active');
			this.validation();
		}
	}
}
