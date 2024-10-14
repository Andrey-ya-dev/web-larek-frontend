import { IOrder, IProductItem } from '../types';
import { Api, ApiListResponse } from './base/api';

export interface ILarekAPI {
	getProductList: () => Promise<ApiListResponse<IProductItem>>;
	getOneProduct: (id: string) => Promise<IProductItem>;
	sendOrder: (data: IOrder) => Promise<{ id: string; total: number }>;
}

export class WebLarekAPI extends Api implements ILarekAPI {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getOneProduct(id: string): Promise<IProductItem> {
		return this.get<IProductItem>(`/product/${id}`).then((item) => {
			return {
				...item,
				image: this.cdn + item.image,
			};
		});
	}

	getProductList(): Promise<ApiListResponse<IProductItem>> {
		return this.get<ApiListResponse<IProductItem>>('/product/').then((data) => {
			data.items = data.items.map((item) => {
				return {
					...item,
					image: this.cdn + item.image,
				};
			});

			return data;
		});
	}

	sendOrder(data: IOrder): Promise<{ id: string; total: number }> {
		return this.post<{ id: string; total: number }>('/order', data).then(
			(data) => {
				return data;
			}
		);
	}
}
