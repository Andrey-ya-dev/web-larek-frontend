import './scss/styles.scss';

import { WebLarekAPI } from './components/WebLarekAPI';
import { CDN_URL, API_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { WebLarekModel } from './components/WebLarekModel';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { TOrderField, TPaymentOption } from './types';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';
import { Loader } from './components/common/Loader';
import { BasketItemCard, ProductItemCard } from './components/Card';

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
const loaderTemplate = ensureElement<HTMLTemplateElement>('#loader');

const page = new Page(document.querySelector('.page'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events, {
	onClick: (name) => {
		events.emit('model:payment:select', { payment: name });
	},
});
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);
const loader = new Loader(cloneTemplate(loaderTemplate));

page.loader = loader.render();
loader.showLoader();

// Слушатели событий

events.on('items:change', () => {
	const elements = webLarekModel.getCatalog().map((item) => {
		return new ProductItemCard(cloneTemplate(cardCatalogTemplate), events, {
			onClick: () => events.emit('model:item:select', item),
		}).render(item);
	});

	page.basketCount = webLarekModel.getBasketCountItems();
	page.catalog = elements;
});

events.on('model:item:select', (item: { id: string }) => {
	loader.showLoader();

	api
		.getOneProduct(item.id)
		.then((product) => {
			webLarekModel.selectItem(product.id);
		})
		.catch((err) => console.warn(err))
		.finally(() => {
			loader.hideLoader();
		});
});

events.on('view:item:select', (item: { id: string }) => {
	const { id } = item;
	const isItemInBasket = webLarekModel.isItemInBasket(id);
	const itemData = webLarekModel.getSelectedItem();

	const cardFullInfo = new ProductItemCard(
		cloneTemplate(cardFullTemplate),
		events,
		{
			onClick: () =>
				events.emit(
					isItemInBasket ? 'model:item:remove' : 'model:item:add',
					itemData
				),
		}
	);

	modal.render({
		content: cardFullInfo.render({
			buttonText: isItemInBasket ? 'Убрать' : 'Купить',
			...itemData,
		}),
	});
});

events.on('model:item:add', (item: { id: string }) => {
	webLarekModel.addItemInBasket(item.id);
});

events.on('view:item:add', () => {
	modal.close();
});

events.on('model:item:remove', (item: { id: string; isBasket?: boolean }) => {
	webLarekModel.removeItemFromBasket(item.id, item.isBasket);
});

events.on('view:item:remove', () => {
	modal.close();
});

events.on('view:basket:open', () => {
	basket.selected = webLarekModel.items;
	modal.render({
		content: basket.render(),
	});
});

events.on('view:basket:change', () => {
	const elements = webLarekModel.getBasket().map((item, idx) => {
		const currentNumber = idx + 1;
		return new BasketItemCard(cloneTemplate(basketCardTemplate), events, {
			onClick: () =>
				events.emit('model:item:remove', { id: item.id, isBasket: true }),
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

events.on('view:order:open', () => {
	const { address, payment } = webLarekModel.getOrder();
	const isOrderValid = webLarekModel.isDatasValid(webLarekModel.getOrder());
	modal.content = order.render({
		errors: [''],
		valid: isOrderValid,
		address,
		payment,
	});
});

events.on('model:payment:select', (option: { payment: TPaymentOption }) => {
	webLarekModel.setPaymentOption(option.payment);
});

events.on('order:submit', () => {
	events.emit('view:contacts:open');
});

events.on(
	/^(contacts|order).*:change/,
	(inputData: { name: TOrderField; value: string }) => {
		webLarekModel.setOrderContact(inputData.name, inputData.value);
	}
);

events.on('formErrors:change', (errorsForms: Record<TOrderField, string>) => {
	const { address } = errorsForms;
	const isOrderValid = webLarekModel.isDatasValid(webLarekModel.getOrder());
	order.valid = isOrderValid;
	order.errors = address || '';

	const isContactsValid = webLarekModel.isDatasValid(
		webLarekModel.getContacts()
	);
	const { phone, email } = errorsForms;
	contacts.valid = isContactsValid;
	contacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

events.on('view:contacts:open', () => {
	const { phone, email } = webLarekModel.getContacts();
	const isContactsValid = webLarekModel.isDatasValid(
		webLarekModel.getContacts()
	);
	modal.content = contacts.render({
		phone,
		email,
		errors: [],
		valid: isContactsValid,
	});
});

events.on('contacts:submit', () => {
	loader.showLoader();
	modal.close();

	api
		.sendOrder(webLarekModel.getFinalOrder())
		.then((response) => {
			modal.render({
				content: success.render({
					infoPrice: response.total,
				}),
			});
		})
		.catch((err) => console.warn(err))
		.finally(() => {
			order.clearData();
			webLarekModel.clearOrderData();
			webLarekModel.clearBasketData();
			loader.hideLoader();
		});
});

events.on('order:done', () => {
	modal.close();
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

api
	.getProductList()
	.then((data) => {
		webLarekModel.setCatalog(data.items);
	})
	.catch((err) => console.warn(err))
	.finally(() => {
		loader.hideLoader();
	});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.larek = webLarekModel;
