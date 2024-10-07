import './scss/styles.scss';

import { WebLarekAPI } from './components/WebLarekAPI';
import { CDN_URL, API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { WebLarekModel } from './components/WebLarekModel';
import { BasketProduct, Product } from './components/Product';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { IProductItem, TOrderField, TPaymentOption } from './types';
import { Order } from './components/Order';
import { Form } from './components/common/Form';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new WebLarekAPI(CDN_URL, API_URL);
const webLarekModel = new WebLarekModel(events);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardFullTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const basketCardTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');

const page = new Page(document.querySelector('.page__wrapper'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const formContacts = new Form(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);

// events listeners
events.on('items:change', () => {
	console.log('items-changed');

	const elements = webLarekModel.getCatalog().map((item) => {
		return new Product(cloneTemplate(cardCatalogTemplate), events, {
			onClick: () => events.emit('select:item', item),
		}).render(item);
	});

	page.basketCount = webLarekModel.getBasketCountItems();
	page.catalog = elements;
});

events.on('select:item', (item: { id: string }) => {
	console.log('select-item ', item.id);
	//api get
	const { id } = item;
	webLarekModel.selectItem(id);
	const isItemInBasket = webLarekModel.isItemInBasket(id);
	const itemData = webLarekModel.getSelectedItem();

	const cardFullInfo = new Product(cloneTemplate(cardFullTemplate), events, {
		onClick: () => events.emit('item:add', itemData),
	});

	if (isItemInBasket) {
		cardFullInfo.blockBtn();
	} else {
		cardFullInfo.unBlockBtn();
	}

	modal.content = cardFullInfo.render(itemData);
	modal.open();
});

events.on('item:add', (item: { id: string }) => {
	console.log('item-add ', item.id);

	webLarekModel.addItemInBasket(item.id);
	page.basketCount = webLarekModel.getBasketCountItems();
	modal.close();
});

events.on('item:remove', (item: IProductItem) => {
	console.log('item remove ', item.id);

	webLarekModel.removeItemFromBasket(item.id);
	page.basketCount = webLarekModel.getBasketCountItems();
});

events.on('basket:change', () => {
	console.log('basket-change');

	const elements = webLarekModel.getBasket().map((item, idx) => {
		const currentNumber = idx + 1;
		return new BasketProduct(cloneTemplate(basketCardTemplate), events, {
			onClick: () => events.emit('item:remove', item),
		}).render({
			id: item.id,
			title: item.title,
			price: item.price,
			total: `${currentNumber}`,
		});
	});
	basket.items = elements;
	basket.total = webLarekModel.basketTotal;
	basket.selected = webLarekModel.items;
});

events.on('basket:open', () => {
	basket.selected = webLarekModel.items;
	modal.content = basket.render();
	modal.open();
});

events.on('order:open', () => {
	console.log('order-open');

	modal.content = order.render();
});

events.on('payment:select', (option: { payment: TPaymentOption }) => {
	console.log('payment-select', option);

	webLarekModel.setPaymentOption(option.payment);

	const paymentOption = webLarekModel.getPaymentOption();
	order.selectOption(paymentOption);
});

events.on('order:submit', (adress: { name: TOrderField; value: string }) => {
	console.log('order-submit');

	webLarekModel.setOrderContact(adress.name, adress.value);
});

events.on('contacts:open', () => {
	console.log('contacts-open');

	modal.content = formContacts.render();
});

events.on('contacts:change', () => {
	console.log('contacts-change');

	formContacts.validation();
});

events.on(
	'contacts:submit',
	(data: { contacts: Record<TOrderField, string> }) => {
		console.log('contacts-submit', data);

		Object.keys(data.contacts).forEach((key: TOrderField) => {
			webLarekModel.setOrderContact(key, data.contacts[key]);
		});

		if (webLarekModel.isOrderValid()) {
			const finalOrder = webLarekModel.getFinalOrder().total;
			console.log(
				'order ',
				JSON.parse(JSON.stringify(webLarekModel.getOrder()))
			);

			modal.content = success.render({ infoPrice: finalOrder });
		} else {
			console.warn('order wrong ', webLarekModel.getOrder());
		}
	}
);

events.on('order:success:open', () => {
	webLarekModel.clearBasketData();
	order.clearOrder();
	formContacts.clearForm();
});

events.on('order:success:close', () => {
	webLarekModel.cOrder();
	modal.close();
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	document
		.querySelector('.page__wrapper')
		.classList.add('page__wrapper_locked');
});

// ... и разблокируем
events.on('modal:close', () => {
	document
		.querySelector('.page__wrapper')
		.classList.remove('page__wrapper_locked');
});

api.getProductList().then((data) => {
	webLarekModel.setCatalog(data.items);
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.larek = webLarekModel;
