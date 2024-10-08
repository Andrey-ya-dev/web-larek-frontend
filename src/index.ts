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
import { TOrderField, TPaymentOption } from './types';
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

// Слушатели событий

// Главная страница
events.on('items:change', () => {
	console.log('items-changed');

	const elements = webLarekModel.getCatalog().map((item) => {
		return new Product(cloneTemplate(cardCatalogTemplate), events, {
			onClick: () => events.emit('model:item:select', item),
		}).render(item);
	});

	page.basketCount = webLarekModel.getBasketCountItems();
	page.catalog = elements;
});
// Выбор продука для просмотра
events.on('model:item:select', (item: { id: string }) => {
	webLarekModel.selectItem(item.id);
});

events.on('view:item:select', (item: { id: string }) => {
	console.log('view-item-select ', item.id);
	//api get
	const { id } = item;
	const isItemInBasket = webLarekModel.isItemInBasket(id);
	const itemData = webLarekModel.getSelectedItem();

	const cardFullInfo = new Product(cloneTemplate(cardFullTemplate), events, {
		onClick: () => events.emit('model:item:add', itemData),
	});

	if (isItemInBasket) {
		cardFullInfo.blockBtn();
	} else {
		cardFullInfo.unBlockBtn();
	}

	modal.content = cardFullInfo.render(itemData);
	modal.open();
});

// Действия с продуктом
events.on('model:item:add', (item: { id: string }) => {
	webLarekModel.addItemInBasket(item.id);
});

events.on('view:item:add', () => {
	console.log('view-item-add ');

	// page.basketCount = webLarekModel.getBasketCountItems(); // ??
	modal.close();
});

events.on('model:item:remove', (item: { id: string }) => {
	console.log('model-item-add ', item.id);

	webLarekModel.removeItemFromBasket(item.id);
});

events.on('view:item:remove', () => {
	console.log('view item remove ');

	// page.basketCount = webLarekModel.getBasketCountItems(); //??
});
// Корзина
events.on('view:basket:open', () => {
	basket.selected = webLarekModel.items;
	modal.content = basket.render();
	modal.open();
});

events.on('view:basket:change', () => {
	console.log('view-basket-change');

	const elements = webLarekModel.getBasket().map((item, idx) => {
		const currentNumber = idx + 1;
		return new BasketProduct(cloneTemplate(basketCardTemplate), events, {
			onClick: () => events.emit('model:item:remove', item),
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

	page.basketCount = webLarekModel.getBasketCountItems();
});
// Заказ
events.on('view:order:open', () => {
	console.log('view-order-open');

	modal.content = order.render();
});

events.on('model:payment:select', (option: { payment: TPaymentOption }) => {
	webLarekModel.setPaymentOption(option.payment);
});

events.on('view:payment:select', () => {
	console.log('view-payment-select');

	const paymentOption = webLarekModel.getPaymentOption();
	order.selectOption(paymentOption);
});

events.on('view:order:change', () => {
	console.log('view-order-change');

	order.validation();
});

events.on(
	'model:order:submit',
	(adress: { name: TOrderField; value: string }) => {
		console.log('model-order-submit');

		webLarekModel.setOrderContact(adress.name, adress.value);
	}
);

// view order submit -> проверка ошибок показать ошибку

// Форма контактов
events.on('view:contacts:open', () => {
	console.log('view-contacts-open');

	formContacts.validation();
	modal.content = formContacts.render();
});

events.on('view:contacts:change', () => {
	console.log('view-contacts-change');

	formContacts.validation();
});

events.on(
	'model:contacts:submit',
	(data: { contacts: Record<TOrderField, string> }) => {
		console.log('model:contacts:submit ');

		Object.keys(data.contacts).forEach((key: TOrderField) => {
			webLarekModel.setOrderContact(key, data.contacts[key]);
		});
	}
);

// view contacts submit -> проверка ошибок показать ошибку

events.on('view:contacts:submit', () => {
	console.log('view-contacts-submit');

	// view success open
	if (webLarekModel.isOrderValid()) {
		const finalOrder = webLarekModel.getFinalOrder().total;
		console.log(
			'order ',
			JSON.parse(JSON.stringify(webLarekModel.getFinalOrder()))
		);

		modal.content = success.render({ infoPrice: finalOrder });
	} else {
		console.warn('order wrong ', webLarekModel.getOrder());
	}
});
// Успешный заказ
events.on('view:success:open', () => {
	webLarekModel.clearBasketData();
	order.clearOrder();
	formContacts.clearForm();
});

events.on('view:success:done', () => {
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
