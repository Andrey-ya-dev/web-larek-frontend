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
	// сменить на контакты??
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
		return this.items.map((itemId) => {
			return this.catalog.find((item) => item.id === itemId);
		});
	}

	getItem(id: string) {
		return this.catalog.find((item) => item.id === id);
	}

	selectItem(id: string) {
		this.selectedItemId = id;
		this.events.emit('view:item:select', {
			id,
		});
	}

	getSelectedItem() {
		return this.getItem(this.selectedItemId);
	}

	setPaymentOption(option: TPaymentOption) {
		this.order.payment = option;
		this.events.emit('view:payment:select');
		this.events.emit('step:one:valid');
	}

	getPaymentOption() {
		return this.order.payment;
	}

	setOrderContact(name: TOrderField, value: string) {
		this.order[name] = value;
		this.events.emit('view:order:submit'); //??
		// this.events.emit('view:contacts:submit');
		if (name === 'address') {
			this.events.emit('step:one:valid');
		} else {
			this.events.emit('step:two:valid');
		}
	}

	isOrderValid() {
		return Object.values(this.order).every((value) => value.length > 0);
	}

	getOrder() {
		if (this.isOrderValid()) {
			return this.order;
		}
	}

	getFinalOrder() {
		const order = { ...this.order, ...this.basket };
		return order;
	}

	set items(data: string[]) {
		this.basket.items = data;
		this.events.emit('view:basket:change');
	}

	get items() {
		return this.basket.items;
	}

	set basketTotal(value: number) {
		this.basket.total = value;
	}

	get basketTotal() {
		this.calculateBasketPrice(this.catalog);
		return this.basket.total;
	}

	addItemInBasket(id: string) {
		if (!this.isItemInBasket(id)) {
			this.basket.items.push(id);
			this.calculateBasketPrice(this.catalog);
			this.events.emit('view:item:add');
			this.events.emit('view:basket:change');
		}
	}

	isItemInBasket(id: string) {
		return this.items.find((itemId) => itemId === id);
	}

	removeItemFromBasket(id: string) {
		this.items = this.items.filter((itemId) => itemId !== id);
		this.calculateBasketPrice(this.catalog);
		this.events.emit('view:basket:change');
	}

	calculateBasketPrice(data: IProductItem[]) {
		const notFoundPrice = 0;
		this.basketTotal = this.items.reduce((acc, curr) => {
			const product = data.find((item) => item.id === curr);
			if (product) {
				const { price } = product;
				return acc + price;
			} else {
				return acc + notFoundPrice;
			}
		}, 0);
	}

	getBasketCountItems() {
		return this.items.length;
	}

	clearBasketData() {
		this.items = [];
		this.basketTotal = 0;
	}

	cOrder() {
		this.selectedItemId = undefined;
		this.setPaymentOption('');
		this.order = {
			address: '',
			email: '',
			payment: '',
			phone: '',
		};
	}

	validateStepOne() {
		return (
			this.order.address.length > 0 &&
			(this.order.payment === 'card' || this.order.payment === 'cash')
		);
	}

	validateStepTwo() {
		return this.order.phone.length > 0 && this.order.email.length > 0;
	}

	getContactsError() {
		const { phone, email } = this.order;
		if (!phone && !email) {
			return 'Both fields are empty';
		}
		if (!phone.length) {
			return 'Phone is empty';
		}
		if (!email.length) {
			return 'Email is empty';
		}
		return '';
	}

	getAddressError() {
		if (!this.order.address.length) {
			return 'Address is empty';
		}
		return '';
	}

	getErrorMsg(obj: Record<string, string>, msg: string) {
		const errorStore: Record<string, string> = {}; //Set,Map
		Object.keys(obj).forEach((key: string) => {
			if (!key.length) {
				errorStore[key] = `${key} ${msg}`;
			}
		});
		return errorStore;
	}

	validateSomeObj(obj: Record<string, string>) {
		return !!Object.values(obj).filter((str) => str.length > 0).length;
	}
}
