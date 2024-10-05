import './scss/styles.scss';

import { WebLarekAPI } from './components/WebLarekAPI';
import { CDN_URL, API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { WebLarekModel } from './components/WebLarekModel';
import { BasketProduct, Product } from './components/Product';
import { Page } from './components/Page';

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
const basketProduct = new BasketProduct(
	cloneTemplate(basketCardTemplate),
	events
);

events.on('items:change', () => {
	console.log('items:changed');

	const elements = webLarekModel.getCatalog().map((item) => {
		return new Product(cloneTemplate(cardCatalogTemplate), events).render(item);
	});

	page.basketCount = webLarekModel.getBasketCountItems();
	page.catalog = elements;
	console.log('basket item', basketProduct.render());
});

api.getProductList().then((data) => {
	console.log(data);
	webLarekModel.setCatalog(data.items);
});
