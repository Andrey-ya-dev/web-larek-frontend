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
import { IProductItem } from './types';

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

events.on('items:change', () => {
	console.log('items:changed');

	const elements = webLarekModel.getCatalog().map((item) => {
		return new Product(cloneTemplate(cardCatalogTemplate), events, {
			onClick: () => events.emit('select:item', item),
		}).render(item);
	});

	page.basketCount = webLarekModel.getBasketCountItems();
	page.catalog = elements;
});

events.on('select:item', (item: { id: string }) => {
	//api get
	const { id } = item;
	console.log('select:item ', id);
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
	console.log('item add ', item);

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
	console.log('b open');

	const elements = webLarekModel.getBasket().map((item, idx) => {
		return new BasketProduct(cloneTemplate(basketCardTemplate), events, {
			onClick: () => events.emit('item:remove', item),
		}).render({
			id: item.id,
			title: item.title,
			price: item.price,
			total: `${idx + 1}`,
		});
	});
	basket.items = elements;
	basket.total = webLarekModel.basketTotal;
	basket.selected = webLarekModel.items;
	modal.content = basket.render();
});

events.on('basket:open', () => {
	basket.selected = webLarekModel.items;
	modal.content = basket.render();
	modal.open();
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
	console.log(data);
	webLarekModel.setCatalog(data.items);
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.larek = webLarekModel;
