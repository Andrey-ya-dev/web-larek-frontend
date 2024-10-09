export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number;
}
export type TProductInCatalog = Omit<IProductItem, 'description'>;
export type TProductInBasket = Pick<IProductItem, 'id' | 'title' | 'price'>;

export type TPaymentOption = 'card' | 'cash' | '';

export interface IOrder {
	payment: TPaymentOption;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}
export type TOrder = Omit<IOrder, 'items' | 'total'>;

export type TBasket = Pick<IOrder, 'items' | 'total'>;

export type TOrderField = 'address' | 'phone' | 'email';

export interface IOrderSuccess {
	id: string;
	total: number;
}

export interface ErrorMessage {
	error: string;
}
