import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/events';

interface IPage {
	catalog: HTMLElement[];
	basketCount: number;
	loader: HTMLElement;
}

export class Page extends Component<IPage> {
	protected catalogContaner: HTMLElement;
	protected basketCountElement: HTMLElement;
	protected basketOpenButton: HTMLElement;
	protected wrapperElement: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this.catalogContaner = ensureElement('.gallery', this.container);
		this.basketOpenButton = ensureElement('.header__basket', this.container);
		this.basketCountElement = ensureElement(
			'.header__basket-counter',
			this.container
		);
		this.wrapperElement = ensureElement('.page__wrapper', this.container);

		this.basketOpenButton.addEventListener('click', () => {
			this.events.emit('view:basket:open');
		});
	}

	set catalog(items: HTMLElement[]) {
		this.catalogContaner.replaceChildren(...items);
	}

	set basketCount(value: number) {
		this.setText(this.basketCountElement, `${value}`);
	}

	set loader(element: HTMLElement) {
		this.container.insertAdjacentElement('beforeend', element);
	}

	set locked(value: boolean) {
		if (value) {
			this.wrapperElement.classList.add('page__wrapper_locked');
		} else {
			this.wrapperElement.classList.remove('page__wrapper_locked');
		}
	}
}
