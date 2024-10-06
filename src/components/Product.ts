import { IProductItem } from '../types';
import { Component } from './base/Component';
import { IEvents } from './base/events';

export class Product extends Component<IProductItem> {
	protected _id: string;
	protected card: HTMLElement;
	protected cardCategory: HTMLElement;
	protected cardTitle: HTMLElement;
	protected cardImage: HTMLElement;
	protected cardPrice: HTMLElement;
	protected cardDescription: HTMLElement;
	protected cardButton: HTMLElement;

	constructor(protected container: HTMLElement, protected events?: IEvents) {
		super(container);

		this.cardCategory = container.querySelector('.card__category');
		this.cardTitle = container.querySelector('.card__title');
		this.cardImage = container.querySelector('.card__image');
		this.cardPrice = container.querySelector('.card__price');
		this.cardDescription = container.querySelector('.card__text');
		this.cardButton = container.querySelector('.card__button');

		if (this.cardButton) {
			this.cardButton.addEventListener('click', (e: Event) => {
				e.stopPropagation();
				console.log('add btn card ', this._id);

				this.events.emit('item:add', { id: this._id });
			});
		}

		this.container.addEventListener('click', (e: Event) => {
			console.log('set card ', this._id);

			this.events.emit('select:item', { id: this._id });
		});
	}

	set id(id: string) {
		this._id = id;
	}

	set title(value: string) {
		this.setText(this.cardTitle, value);
	}

	set category(value: string) {
		this.setText(this.cardCategory, value);
	}

	set image(value: string) {
		this.cardImage.setAttribute('src', `${value}`);
	}

	set price(value: string) {
		if (value) {
			this.setText(this.cardPrice, `${value} синапсов`);
		} else {
			this.setText(this.cardPrice, `Бесценно`);
		}
	}

	set description(value: string) {
		this.setText(this.cardDescription, value);
	}
}

export class BasketProduct extends Product {
	protected removeBtn: HTMLElement;
	protected productIdx: HTMLElement;

	constructor(protected container: HTMLElement, protected evetns: IEvents) {
		super(container);

		this.removeBtn = container.querySelector('.card__button');
		this.productIdx = container.querySelector('.basket__item-index');

		this.container.addEventListener('click', null);
		this.removeBtn.addEventListener('click', () => {
			console.log('remove btn');
		});
	}

	set price(value: string) {
		console.log(value, 'price');
		if (value && value !== 'null') {
			this.cardPrice.textContent = `${value}`;
		} else {
			this.cardPrice.textContent = `0`;
		}
	}
}
