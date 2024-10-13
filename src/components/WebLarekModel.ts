import {
	IOrder,
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
	protected contacts: Pick<TOrder, 'email' | 'phone'> = {
		phone: '',
		email: '',
	};
	protected order: Partial<TOrder> = {
		address: '',
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
		if (name === 'address') {
			this.order[name] = value;
			this.events.emit('step:one:valid');
		} else {
			this.contacts[name] = value;
			this.events.emit('step:two:valid');
		}
		this.validateDatas();
	}

	isDatasValid(obj: Partial<TOrder>) {
		return Object.values(obj).every((value) => value.length);
	}

	getContacts() {
		return this.contacts;
	}

	getOrder() {
		// if (this.isDatasValid(this.order)) {}
		return this.order;
	}

	getFinalOrder() {
		this.items = this.basket.items.filter((item) => {
			return this.getItem(item).price > 0;
		});
		const order = { ...this.order, ...this.contacts, ...this.basket };
		return order as IOrder;
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
			payment: '',
		};
		this.contacts = {
			phone: '',
			email: '',
		};
	}

	validateStepOne() {
		return (
			this.order.address.length > 0 &&
			(this.order.payment === 'card' || this.order.payment === 'cash')
		);
	}
	validateOrder() {
		const orderError: Record<string, string> = {};
		if (!this.order.address) {
			orderError.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			orderError.address = 'Необходимо выбрать способ оплаты';
		}
		return orderError;
	}
	validateContacts() {
		const contactsError: Record<string, string> = {};
		if (!this.contacts.phone) {
			contactsError.phone = 'Необходимо указать телефон';
		}
		if (!this.contacts.email) {
			contactsError.email = 'Необходимо указать email';
		}
		return contactsError;
	}
	validateDatas() {
		const datasError: Record<string, string> = {};
		if (!this.contacts.phone) {
			datasError.phone = 'Необходимо указать телефон';
		}
		if (!this.contacts.email) {
			datasError.email = 'Необходимо указать email';
		}
		if (!this.order.address) {
			datasError.address = 'Необходимо указать адрес';
		}
		if (!this.order.payment) {
			datasError.address = 'Необходимо выбрать способ оплаты';
		}
		this.events.emit('formErrors:change', datasError);
		return datasError;
	}

	validateStepTwo() {
		return this.contacts.phone.length > 0 && this.contacts.email.length > 0;
	}

	getContactsError() {
		const { phone, email } = this.contacts;
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
			if (!obj[key].length) {
				errorStore[key] = `${key} ${msg}`;
			}
		});
		return errorStore;
	}
}
