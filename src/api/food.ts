import { parse } from 'papaparse';

export interface Dish {
  id: string;
  name: string;
  tag: string;
  canteen: string[];
}

export type DishListResponse = {
  code: number;
  message: string;
  data: {
    list: Dish[];
    total: number;
    page: number;
    page_size: number;
  };
};

async function loadDishesFromCSV(): Promise<Dish[]> {
  const response = await fetch('/data/dishs.csv');
  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.statusText}`);
  }
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV 解析警告:', results.errors);
        }
        const dishes: Dish[] = results.data.map((row: any, index: number) => {
          const canteenRaw = row['食堂']?.toString().trim() || '';
          const canteenList = canteenRaw.split(',');

          return {
            id: `dish_${index}`,
            name: row['菜品名称']?.toString() || '',
            tag: row['标签']?.toString() || '',
            canteen: canteenList
          };
        });
        resolve(dishes);
      },
      error: (error: any) => {
        reject(new Error(`CSV 解析失败: ${error.message}`));
      }
    });
  });
}

export async function getDishList(
  params: {
    page?: number;
    page_size?: number;
    tag?: string;
    canteen?: string;
    search?: string;
  } = {}
): Promise<DishListResponse> {
  const allDishes = await loadDishesFromCSV();

  let filtered = allDishes.filter((dish) => {
    if (params.tag && dish.tag !== params.tag) return false;
    if (params.canteen && !dish.canteen.includes(params.canteen)) return false;
    if (params.search && !dish.name.toLowerCase().includes(params.search.toLowerCase()))
      return false;
    return true;
  });

  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 20;
  const startIndex = (page - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  return {
    code: 200,
    message: 'success',
    data: {
      list: paginatedData,
      total: filtered.length,
      page,
      page_size: pageSize
    }
  };
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
