import { parse } from 'papaparse';

export type Dish = {
  id: string;
  name: string;
  tag: string;
  canteen: string[];
};

type dishRow = {
  name: string;
  tag: string;
  canteen: string;
};

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

  const { data, errors } = parse<dishRow>(csvText, {
    header: true,
    skipEmptyLines: true
  });
  if (errors.length) {
    console.warn('CSV 解析警告:', errors);
  }
  return data.map((row: dishRow, index: number) => {
    const canteenRaw = row.canteen.split(',');
    return {
      id: `dish_${index}`,
      name: row.name,
      tag: row.tag,
      canteen: canteenRaw
    };
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

export function getAvailableTags(): string[] {
  return ['主食', '小吃', '早餐'];
}

export function getAvailableCanteens(): string[] {
  return ['公一食堂', '公二食堂', '公三食堂', '研二食堂', '清真食堂'];
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
