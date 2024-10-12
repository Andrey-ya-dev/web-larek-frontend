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
import { Order, _Contacts, _Order } from './components/Order';
import { Form } from './components/common/Form';
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
const order = new Order(cloneTemplate(orderTemplate), events);
const _order = new _Order(cloneTemplate(orderTemplate), events, {
	onClick: (name) => {
		console.log('_order name ', name);
		events.emit('model:payment:select', { payment: name });
	},
});
const formContacts = new Form(cloneTemplate(contactsTemplate), events);
const _contacts = new _Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), events);
const loader = new Loader(cloneTemplate(loaderTemplate));
// document.body.append(loader.showLoader().render());
page.loader = loader.render();
loader.showLoader();

function fakeReq(timeOut: number, item: Record<string, string>) {
	loader.showLoader();
	setTimeout(() => {
		return Promise.resolve()
			.then(() => {
				webLarekModel.selectItem(null);
				webLarekModel.selectItem(item.id);
			})
			.catch((err) => console.warn(err))
			.finally(() => {
				loader.hideLoader();
			});
	}, timeOut);
}

// Слушатели событий

// Главная страница
events.on('items:change', () => {
	console.log('items-changed');

	const elements = webLarekModel.getCatalog().map((item) => {
		return new ProductItemCard(cloneTemplate(cardCatalogTemplate), events, {
			onClick: () => events.emit('model:item:select', item),
		}).render(item);
	});

	page.basketCount = webLarekModel.getBasketCountItems();
	page.catalog = elements;
});
// Выбор продука для просмотра
events.on('model:item:select', (item: { id: string }) => {
	// loader.showLoader();
	// webLarekModel.selectItem(item.id);
	// loader.hideLoader();

	fakeReq(500, item);

	// api
	// 	.getOneProduct(item.id)
	// 	.then((product) => {
	// 		webLarekModel.selectItem(product.id);
	// 	})
	// 	.catch((err) => console.warn(err))
	// 	.finally(() => {
	// 		loader.hideLoader();
	// 	});
});

events.on('view:item:select', (item: { id: string }) => {
	console.log('view-item-select ', item.id);

	const { id } = item;
	// можно возвращать обьект {isInBsket,selectedEl}
	const isItemInBasket = webLarekModel.isItemInBasket(id);
	const itemData = webLarekModel.getSelectedItem();

	const cardFullInfo = new ProductItemCard(
		cloneTemplate(cardFullTemplate),
		events,
		{
			onClick: () => events.emit('model:item:add', itemData),
		}
	);

	if (isItemInBasket) {
		cardFullInfo.disabledBtn();
	} else {
		cardFullInfo.unDisabledBtn();
	}

	modal.content = cardFullInfo.render(itemData);
	modal.open();
});

// Действия с продуктом
events.on('model:item:add', (item: { id: string }) => {
	console.log('model-item-add ');

	webLarekModel.addItemInBasket(item.id);
});

events.on('view:item:add', () => {
	console.log('view-item-add ');

	modal.close();
});
//&&&&&&&&&&&&&&&&&&&&& до этой линии норм
// действия из корзины
events.on('model:item:remove', (item: { id: string }) => {
	console.log('model-item-add ', item.id);

	webLarekModel.removeItemFromBasket(item.id);
});

// Корзина
events.on('view:basket:open', () => {
	console.log('view-basket-open ');
	// basketItems ??
	basket.selected = webLarekModel.items;
	// modal.content = basket.render();
	// modal.open();
	modal.render({
		content: basket.render(),
	});
});

events.on('view:basket:change', () => {
	console.log('view-basket-change');

	const elements = webLarekModel.getBasket().map((item, idx) => {
		const currentNumber = idx + 1;
		return new BasketItemCard(cloneTemplate(basketCardTemplate), events, {
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

	modal.content = _order.render({ errors: [''], valid: false, address: '' });
});

events.on('model:payment:select', (option: { payment: TPaymentOption }) => {
	console.log('model-payment-select');

	webLarekModel.setPaymentOption(option.payment);
});

// events.on('view:payment:select', () => {
// 	console.log('view-payment-select');

// 	// const paymentOption = webLarekModel.getPaymentOption();
// 	// order.selectOption(paymentOption);
// });

// events.on('view:order:change', () => {
// 	console.log('view-order-change');

// 	order.validation();
// });

// events.on(
// 	'model:order:submit',
// 	(adress: { name: TOrderField; value: string }) => {
// 		console.log('model-order-submit');

// 		webLarekModel.setOrderContact(adress.name, adress.value);
// 	}
// );

// view order submit -> проверка ошибок показать ошибку
events.on('order:submit', () => {
	console.log('order-submit');

	events.emit('view:contacts:open');
});
events.on('address:change', (adress: { name: TOrderField; value: string }) => {
	console.log('address-change = ', adress);

	webLarekModel.setOrderContact(adress.name, adress.value);
});
events.on('phone:change', (adress: { name: TOrderField; value: string }) => {
	console.log('phone-change = ', adress);

	webLarekModel.setOrderContact(adress.name, adress.value);
});
events.on('email:change', (adress: { name: TOrderField; value: string }) => {
	console.log('phone-change = ', adress);

	webLarekModel.setOrderContact(adress.name, adress.value);
});
events.on('step:one:valid', () => {
	const stepOneValue = webLarekModel.validateStepOne();
	const message = webLarekModel.getAddressError();
	console.log('message = ', message);
	_order.valid = stepOneValue;
	_order.errors = message;
});
events.on('step:two:valid', () => {
	const stepTwoValue = webLarekModel.validateStepTwo();
	const message = webLarekModel.getContactsError();
	console.log('message = ', message);
	_contacts.valid = stepTwoValue;
	_contacts.errors = message;
});

// Форма контактов
events.on('view:contacts:open', () => {
	console.log('view-contacts-open');

	// formContacts.validation();
	// modal.content = formContacts.render();
	modal.content = _contacts.render({
		phone: '',
		email: '',
		errors: [],
		valid: false,
	});
});
events.on('contacts:submit', () => {
	console.log('contacts-submit');

	events.emit('success:open');
});
events.on('success:open', () => {
	// modal.render({
	// 	content: success.render({
	// 		infoPrice: webLarekModel.getFinalOrder().total,
	// 	}),
	// });
	loader.showLoader();
	setTimeout(() => {
		return Promise.resolve(webLarekModel.getFinalOrder().total)
			.then((data) => {
				modal.render({
					content: success.render({
						infoPrice: data,
					}),
				});
			})
			.catch((err) => console.warn(err))
			.finally(() => {
				_order.clearData();
				webLarekModel.cOrder();
				webLarekModel.clearBasketData();
				loader.hideLoader();
			});
	}, 2000);
});

// events.on('view:contacts:change', () => {
// 	console.log('view-contacts-change');

// 	formContacts.validation();
// });

// events.on(
// 	'model:contacts:submit',
// 	(data: { contacts: Record<TOrderField, string> }) => {
// 		console.log('model:contacts:submit ');

// 		Object.keys(data.contacts).forEach((key: TOrderField) => {
// 			webLarekModel.setOrderContact(key, data.contacts[key]);
// 		});
// 	}
// );

// view contacts submit -> проверка ошибок показать ошибку

events.on('view:contacts:submit', () => {
	console.log('view-contacts-submit');

	// view success open
	if (webLarekModel.isOrderValid()) {
		loader.showLoader();
		// modal.content = document.createElement('div');
		modal.close();

		const finalOrder = webLarekModel.getFinalOrder().total;
		console.log(
			'order ',
			JSON.parse(JSON.stringify(webLarekModel.getFinalOrder()))
		);

		setTimeout(() => {
			return Promise.resolve('data')
				.then((data) => {
					console.log(data, 'Promise');
				})
				.catch((err) => console.warn(err))
				.finally(() => {
					console.log('finally');
					loader.hideLoader();
					modal.content = success.render({ infoPrice: finalOrder });
					modal.open();
				});
		}, 1000);

		// api
		// 	.order(webLarekModel.getFinalOrder())
		// 	.then((data) => {
		// 		console.log(data, ' --- > data');
		// 	})
		// 	.catch((err) => {
		// 		console.warn(err);
		// 	})
		// 	.finally(() => {
		// 		loader.hideLoader();
		// 		modal.content = success.render({ infoPrice: finalOrder });
		// 	});
	} else {
		console.warn('order wrong ', webLarekModel.getOrder());
	}
});
// Успешный заказ
events.on('view:success:open', () => {
	console.log('view-success-open');

	webLarekModel.clearBasketData();
	order.clearOrder();
	formContacts.clearForm();
});

events.on('view:success:done', () => {
	console.log('view-success-done');

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
