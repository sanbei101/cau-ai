import alovaInstance from '@/api/alova';

const API_BASE_URL = 'https://cau-ai-backend.sanbei101.xyz';

export interface Dish {
  id: string;
  name: string;
  tag: string;
  canteen: string[];
}

export interface DishListResponse {
  code: number;
  message: string;
  data: {
    list: Dish[];
    total: number;
    page: number;
    page_size: number;
  };
}

export interface DishListParams {
  page?: number;
  page_size?: number;
  tag?: string;
  canteen?: string;
  search?: string;
}

export async function getDishList(params: DishListParams = {}): Promise<DishListResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.page_size) queryParams.append('page_size', params.page_size.toString());
  if (params.tag) queryParams.append('tag', params.tag);
  if (params.canteen) queryParams.append('canteen', params.canteen);
  if (params.search) queryParams.append('search', params.search);

  const url = `${API_BASE_URL}/api/dish/list${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const res = await alovaInstance.Get<DishListResponse>(url);

  if (res.code !== 200) {
    throw new Error(res.message || 'Failed to fetch dish list');
  }

  return res;
}

export function getAvailableTags(dishes: Dish[]): string[] {
  const tags = new Set(dishes.map((dish) => dish.tag));
  return Array.from(tags).sort();
}

export function getAvailableCanteens(dishes: Dish[]): string[] {
  const canteens = new Set(dishes.flatMap((dish) => dish.canteen));
  return Array.from(canteens).sort();
}

export function filterDishes(
  dishes: Dish[],
  selectedTag?: string,
  selectedCanteen?: string,
  searchTerm?: string
): Dish[] {
  return dishes.filter((dish) => {
    if (selectedTag && dish.tag !== selectedTag) return false;
    if (selectedCanteen && !dish.canteen.includes(selectedCanteen)) return false;
    if (searchTerm && !dish.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });
}
