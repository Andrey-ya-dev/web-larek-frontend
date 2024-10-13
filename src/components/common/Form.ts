import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export class Form<T> extends Component<IFormState> {
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
		this.events.emit(`${this.container.name}:${name}:change`, { value, name });
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
