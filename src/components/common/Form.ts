import { Component } from '../base/Component';
import { IEvents } from '../base/events';

export class Form extends Component<{ contacts: string }> {
	protected inputEmail: HTMLInputElement;
	protected inputPhone: HTMLInputElement;
	protected formButton: HTMLButtonElement;
	protected email = '';
	protected phone = '';

	constructor(protected container: HTMLElement, protected events: IEvents) {
		super(container);

		this.inputEmail = this.container.querySelector('input[name="email"]');
		this.inputPhone = this.container.querySelector('input[name="phone"]');
		this.formButton = this.container.querySelector('.button');

		this.container.querySelectorAll('input').forEach((inp) => {
			if (inp.name === 'email') {
				inp.addEventListener('input', () => {
					this.email = this.inputEmail.value;
					this.events.emit('view:contacts:change');
				});
			} else {
				inp.addEventListener('input', () => {
					this.phone = this.inputPhone.value;
					this.events.emit('view:contacts:change');
				});
			}
		});

		this.container.addEventListener('submit', (e) => {
			e.preventDefault();

			if (this.validation()) {
				this.events.emit('model:contacts:submit', {
					contacts: {
						[this.inputEmail.name]: this.email,
						[this.inputPhone.name]: this.phone,
					},
				});

				this.events.emit('view:success:open');
			} else {
				console.log('no valid contacts');
			}
		});
	}

	validation() {
		console.log('form validation');
		if (this.email.length > 0 && this.phone.length > 0) {
			this.setDisabled(this.formButton, false);
		} else {
			this.setDisabled(this.formButton, true);
		}
		return this.email.length > 0 && this.phone.length > 0;
	}

	clearForm() {
		this.container.querySelectorAll('input').forEach((inp) => {
			inp.value = '';
			this.validation();
		});
		this.clearFormData();
	}

	clearFormData() {
		this.email = '';
		this.phone = '';
	}
}
