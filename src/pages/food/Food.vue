<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  Search,
  Filter,
  Utensils,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircle
} from 'lucide-vue-next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getDishList,
  type Dish,
  getAvailableTags,
  getAvailableCanteens,
  filterDishes
} from '@/api/food';

const dishes = ref<Dish[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const selectedTag = ref<string>('all');
const selectedCanteen = ref<string>('all');

const currentPage = ref(1);
const pageSize = ref(12);
const totalItems = ref(0);
const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));

const fetchDishes = async () => {
  try {
    loading.value = true;
    error.value = null;

    const params = {
      page: currentPage.value,
      page_size: pageSize.value,
      search: searchQuery.value || undefined,
      tag: selectedTag.value !== 'all' ? selectedTag.value : undefined,
      canteen: selectedCanteen.value !== 'all' ? selectedCanteen.value : undefined
    };

    const response = await getDishList(params);
    dishes.value = response.data.list;
    totalItems.value = response.data.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取菜品数据失败';
    console.error('Error fetching dishes:', err);
  } finally {
    loading.value = false;
  }
};

const availableTags = computed(() => getAvailableTags(dishes.value));
const availableCanteens = computed(() => getAvailableCanteens(dishes.value));

const filteredDishes = computed(() => {
  return filterDishes(
    dishes.value,
    selectedTag.value !== 'all' ? selectedTag.value : undefined,
    selectedCanteen.value !== 'all' ? selectedCanteen.value : undefined,
    searchQuery.value
  );
});

const resetFilters = () => {
  searchQuery.value = '';
  selectedTag.value = 'all';
  selectedCanteen.value = 'all';
  currentPage.value = 1;
};

watch([searchQuery, selectedTag, selectedCanteen], () => {
  currentPage.value = 1;
  fetchDishes();
});

watch(currentPage, fetchDishes);

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const goToPreviousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    主食: 'bg-blue-100 text-blue-800',
    早餐: 'bg-yellow-100 text-yellow-800',
    小吃: 'bg-purple-100 text-purple-800',
    饮品: 'bg-green-100 text-green-800',
    汤品: 'bg-orange-100 text-orange-800',
    素食: 'bg-emerald-100 text-emerald-800',
    荤菜: 'bg-red-100 text-red-800'
  };
  return colors[tag] || 'bg-gray-100 text-gray-800';
};

const formatCanteens = (canteens: string[]) => {
  return canteens.join('、');
};

const getPaginationText = () => {
  if (totalItems.value === 0) {
    return '显示 0 项，共 0 项';
  }
  const start = (currentPage.value - 1) * pageSize.value + 1;
  const end = Math.min(currentPage.value * pageSize.value, totalItems.value);
  return `显示 ${start}-${end} 项，共 ${totalItems.value} 项`;
};

onMounted(() => {
  fetchDishes();
});
</script>

<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <Utensils class="h-8 w-8 text-primary" />
        <h1 class="text-3xl font-bold">食堂菜品</h1>
      </div>
      <p class="text-muted-foreground">浏览和搜索各个食堂的菜品信息</p>
    </div>

    <Card class="mb-6">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Filter class="h-5 w-5" />
          筛选条件
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="relative">
            <Search class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input v-model="searchQuery" placeholder="搜索菜品名称..." class="pl-10" />
          </div>

          <Select v-model="selectedTag">
            <SelectTrigger>
              <SelectValue placeholder="选择标签" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部标签</SelectItem>
              <SelectItem v-for="tag in availableTags" :key="tag" :value="tag">
                {{ tag }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedCanteen">
            <SelectTrigger>
              <SelectValue placeholder="选择食堂" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部食堂</SelectItem>
              <SelectItem v-for="canteen in availableCanteens" :key="canteen" :value="canteen">
                {{ canteen }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" @click="resetFilters" class="w-full">重置筛选</Button>
        </div>
      </CardContent>
    </Card>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="space-y-3">
        <Skeleton class="h-32 w-full rounded-lg" />
        <Skeleton class="h-6 w-3/4" />
        <Skeleton class="h-4 w-1/2" />
        <Skeleton class="h-4 w-full" />
      </div>
    </div>

    <div v-else-if="error" class="flex justify-center py-12">
      <div class="w-full">
        <Alert variant="destructive" class="mb-4">
          <AlertCircle />
          <AlertDescription class="font-bold">
            {{ error }}
          </AlertDescription>
        </Alert>
        <div class="text-center">
          <Button @click="fetchDishes" variant="outline" class="gap-2">
            <span>重新加载</span>
          </Button>
        </div>
      </div>
    </div>

    <div v-else-if="filteredDishes.length">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <Card
          v-for="dish in filteredDishes"
          :key="dish.id"
          class="hover:shadow-lg transition-shadow duration-200">
          <CardHeader class="pb-3">
            <div class="flex justify-between items-start gap-2">
              <CardTitle class="text-lg leading-tight line-clamp-2">
                {{ dish.name }}
              </CardTitle>
              <Badge :class="getTagColor(dish.tag)" variant="secondary">
                {{ dish.tag }}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="pt-0">
            <CardDescription class="text-sm">
              <div class="flex items-center gap-2 mb-2">
                <span class="font-medium">食堂:</span>
                <span class="line-clamp-2">{{ formatCanteens(dish.canteen) }}</span>
              </div>
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="canteen in dish.canteen"
                  :key="canteen"
                  variant="outline"
                  class="text-xs">
                  {{ canteen }}
                </Badge>
              </div>
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <!-- 分页控件 -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-sm text-muted-foreground">
          {{ getPaginationText() }}
        </div>

        <Pagination
          v-if="totalPages > 0"
          :total="totalItems"
          :items-per-page="pageSize"
          :page="currentPage"
          @update:page="(page) => goToPage(page)"
          class="w-fit">
          <PaginationContent>
            <PaginationPrevious @click="goToPreviousPage" :disabled="currentPage <= 1">
              <ChevronLeftIcon />
              <span class="hidden sm:block">上一页</span>
            </PaginationPrevious>

            <template v-for="page in totalPages" :key="page">
              <PaginationItem
                v-if="
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                "
                :value="page"
                :isActive="page === currentPage">
                <Button
                  :variant="page === currentPage ? 'default' : 'outline'"
                  size="sm"
                  @click="goToPage(page)"
                  class="h-8 w-8 p-0">
                  {{ page }}
                </Button>
              </PaginationItem>
              <PaginationItem
                v-else-if="
                  (page === currentPage - 2 && currentPage > 3) ||
                  (page === currentPage + 2 && currentPage < totalPages - 2)
                "
                :value="page">
                <PaginationEllipsis />
              </PaginationItem>
            </template>

            <PaginationNext @click="goToNextPage" :disabled="currentPage >= totalPages">
              <span class="hidden sm:block">下一页</span>
              <ChevronRightIcon />
            </PaginationNext>
          </PaginationContent>
        </Pagination>
      </div>
    </div>

    <!-- 空状态 -->
    <Card v-else class="text-center py-12">
      <CardContent>
        <div class="text-muted-foreground mb-4">
          <Utensils class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>没有找到符合条件的菜品</p>
          <p class="text-sm">请尝试调整筛选条件</p>
        </div>
        <Button @click="resetFilters">重置筛选条件</Button>
      </CardContent>
    </Card>
  </div>
</template>
