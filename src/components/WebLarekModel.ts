import {
	IProductItem,
	TBasket,
	TOrder,
	TOrderField,
	TPaymentOption,
} from '../types';
import { IEvents } from './base/events';

export class WebLarekModel {
	protected catalog: IProductItem[] = [];
	protected basket: TBasket = {
		items: [],
		total: 0,
	};
	protected order: TOrder = {
		address: '',
		phone: '',
		email: '',
		payment: '',
	};
	protected selectedItemId: string | undefined;

	constructor(protected events: IEvents) {}

	setCatalog(data: IProductItem[]) {
		this.catalog = data;
		this.events.emit('items:change');
	}

	getCatalog() {
		return this.catalog;
	}

	getBasket() {
		return this.items;
	}

	getItem(id: string) {
		return this.catalog.find((item) => item.id === id);
	}

	selectItem(id: string) {
		this.selectedItemId = this.getItem(id)?.id;
		this.events.emit('select:item');
	}

	getSelectedItem() {
		return this.getItem(this.selectedItemId);
	}

	setPaymentOption(option: TPaymentOption) {
		this.order.payment = option;
		this.events.emit('payment:change');
	}

	getPaymentOption() {
		return this.order.payment;
	}

	setOrderContact(name: TOrderField, value: string) {
		this.order[name] = value;
		this.events.emit('contacts:change');
	}

	isOrderValid() {
		return Object.values(this.order).every((value) => value.length > 0);
	}

	getOrder() {
		if (this.isOrderValid()) {
			return Object.assign(this.order, this.basket);
		}
	}

	set items(data: string[]) {
		this.basket.items = data;
		this.events.emit('basket:change');
	}

	get items() {
		return this.basket.items;
	}

	addItemInBasket(id: string) {
		if (!this.isItemInBasket(id)) {
			this.basket.items.push(id);
			this.calculateBasketPrice(this.catalog);
			this.events.emit('basket:change');
		}
	}

	isItemInBasket(id: string) {
		return this.items.find((itemId) => itemId === id);
	}

	removeItemFromBasket(id: string) {
		this.items = this.items.filter((itemId) => itemId !== id);
		this.calculateBasketPrice(this.catalog);
		this.events.emit('basket:change');
	}

	calculateBasketPrice(data: IProductItem[]) {
		this.basket.total = this.items.reduce((acc, curr, idx) => {
			const { price } = data[idx];
			return acc + price;
		}, 0);
	}

	getBasketCountItems() {
		return this.items.length;
	}

	clearBasketData() {
		this.basket = { items: [], total: 0 };
		this.events.emit('basket:change');
	}
}
