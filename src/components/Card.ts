import { IProductItem } from '../types';
import { bem } from '../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/events';

type TCard = Partial<IProductItem & { total: string; buttonText: string }>;
type TActions = {
	onClick: (e: MouseEvent) => void;
};

export class Card extends Component<TCard> {
	protected _id: string;
	protected cardTitle: HTMLElement;
	protected cardButton: HTMLButtonElement;
	protected cardPrice: HTMLElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEvents,
		protected actions?: TActions
	) {
		super(container);

		this.cardPrice = container.querySelector('.card__price');
		this.cardTitle = container.querySelector('.card__title');
		this.cardButton = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this.cardButton) {
				this.cardButton.addEventListener('click', (e) => {
					actions.onClick(e);
				});
			} else {
				this.container.addEventListener('click', () => {
					this.events.emit('model:item:select', { id: this._id });
				});
			}
		}
	}

	set id(itemId: string) {
		this._id = itemId;
	}

	set title(value: string) {
		this.setText(this.cardTitle, `${value}`);
	}
}

export class ProductItemCard extends Card {
	protected cardCategory: HTMLElement;
	protected cardImage: HTMLElement;
	protected cardPrice: HTMLElement;
	protected cardDescription: HTMLElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEvents,
		protected actions?: TActions
	) {
		super(container, events, actions);

		this.cardCategory = container.querySelector('.card__category');
		this.cardPrice = container.querySelector('.card__price');
		this.cardImage = container.querySelector('.card__image');
		this.cardDescription = container.querySelector('.card__text');
	}

	set category(value: string) {
		this.setText(this.cardCategory, value);
		this.setCategoryCls(value);
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

	set buttonText(value: string) {
		this.setText(this.cardButton, value);
	}

	disabledBtn() {
		this.setDisabled(this.cardButton, true);
	}

	unDisabledBtn() {
		this.setDisabled(this.cardButton, false);
	}

	replaceCls(value: string) {
		const replaceCls = this.cardCategory.classList[1];
		this.cardCategory.classList.replace(
			replaceCls,
			bem('card', 'category', `${value}`).class.replace('.', '')
		);
	}

	setCategoryCls(category: string) {
		switch (category) {
			case 'другое':
				this.replaceCls('other');
				break;
			case 'софт-скил':
				this.replaceCls('soft');
				break;
			case 'кнопка':
				this.replaceCls('button');
				break;
			case 'хард-скил':
				this.replaceCls('hard');
				break;
			case 'дополнительное':
				this.replaceCls('additional');
				break;
			default:
				this.replaceCls('soft');
		}
	}
}

export class BasketItemCard extends Card {
	protected productIdx: HTMLElement;

	constructor(
		protected container: HTMLElement,
		protected events: IEvents,
		protected actions?: TActions
	) {
		super(container, events, actions);

		this.productIdx = container.querySelector('.basket__item-index');
	}

	set price(value: string) {
		if (value && value !== null) {
			this.setText(this.cardPrice, `${value}`);
		} else {
			this.setText(this.cardPrice, `0`);
		}
	}

	set total(value: string) {
		this.setText(this.productIdx, value);
	}
}
