import { ensureElement } from '../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/events';

interface IPage {
	catalog: HTMLElement[];
	basketCount: number;
}

export class Page extends Component<IPage> {
	protected catalogContaner: HTMLElement;
	protected basketCountElement: HTMLElement;
	protected basketElement: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this.catalogContaner = ensureElement('.gallery', this.container);
		this.basketElement = ensureElement('.header__basket', this.container);
		this.basketCountElement = ensureElement(
			'.header__basket-counter',
			this.container
		);

		this.basketElement.addEventListener('click', () => {
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
		this.catalogContaner.append(element);
	}
}
