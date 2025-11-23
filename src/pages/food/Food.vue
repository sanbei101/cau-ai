<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import {
  Search,
  Filter,
  Utensils,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircle,
  Bot,
  Send,
  User
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from '@/components/ui/sheet';
import {
  getDishList,
  type Dish,
  getAvailableTags,
  getAvailableCanteens,
  filterDishes
} from '@/api/food';
import { client } from '@/api/opeai';

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

// AI Chat Logic
const isAiOpen = ref(false);
const aiInput = ref('');
const aiMessages = ref<{ role: 'user' | 'assistant'; content: string }[]>([
  {
    role: 'assistant',
    content: '你好！我是你的食堂美食助手,告诉我你想吃什么,或者你的口味偏好,我来为你推荐！'
  }
]);
const aiLoading = ref(false);

const scrollToBottom = async () => {
  await nextTick();
  const container = document.getElementById('ai-chat-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};

const sendAiMessage = async () => {
  if (!aiInput.value.trim() || aiLoading.value) return;

  const userMessage = aiInput.value;
  aiMessages.value.push({ role: 'user', content: userMessage });
  aiInput.value = '';
  aiLoading.value = true;
  scrollToBottom();

  try {
    // Get all dishes for context
    const allDishesResponse = await getDishList({ page: 1, page_size: 1000 });
    const dishesContext = allDishesResponse.data.list
      .map((d) => `- ${d.name} (${d.tag}, 食堂: ${d.canteen.join(', ')})`)
      .join('\n');

    const response = await client.chat.completions.create({
      model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
      messages: [
        {
          role: 'system',
          content: `你是一个大学食堂的美食推荐助手。
          
          以下是今天供应的菜品列表：
          ${dishesContext}
          
          请根据用户的输入推荐合适的菜品。
          如果用户没有明确需求，可以推荐一些特色菜。
          回答要亲切、幽默，像个懂吃的朋友。
          推荐时请注明菜品所在的食堂。
          `
        },
        ...aiMessages.value.map((m) => ({ role: m.role, content: m.content }))
      ]
    });

    const reply = response.choices[0]?.message?.content || '抱歉，我暂时无法思考了...';
    aiMessages.value.push({ role: 'assistant', content: reply });
  } catch (err) {
    console.error('AI Error:', err);
    aiMessages.value.push({ role: 'assistant', content: '抱歉,连接AI助手时出现了一些问题' });
  } finally {
    aiLoading.value = false;
    scrollToBottom();
  }
};

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

const availableTags = getAvailableTags();
const availableCanteens = getAvailableCanteens();

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
    <div class="mb-8 flex justify-between items-end">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <Utensils class="h-8 w-8 text-primary" />
          <h1 class="text-3xl font-bold">食堂菜品</h1>
        </div>
        <p class="text-muted-foreground">浏览和搜索各个食堂的菜品信息</p>
      </div>

      <Sheet v-model:open="isAiOpen">
        <SheetTrigger as-child>
          <Button class="gap-2">
            <Bot class="h-4 w-4" />
            AI 推荐
          </Button>
        </SheetTrigger>
        <SheetContent class="flex flex-col h-full sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>AI 美食助手</SheetTitle>
            <SheetDescription> 不知道吃什么？让我来为你推荐！ </SheetDescription>
          </SheetHeader>

          <div class="flex-1 overflow-y-auto py-4 space-y-4 pr-2" id="ai-chat-container">
            <!-- Messages -->
            <div
              v-for="(msg, index) in aiMessages"
              :key="index"
              :class="['flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '']">
              <div
                :class="[
                  'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                ]">
                <User v-if="msg.role === 'user'" class="h-5 w-5" />
                <Bot v-else class="h-5 w-5" />
              </div>
              <div
                :class="[
                  'rounded-lg p-3 text-sm max-w-[80%]',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                ]">
                {{ msg.content }}
              </div>
            </div>
            <div v-if="aiLoading" class="flex gap-3">
              <div class="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Bot class="h-5 w-5" />
              </div>
              <div class="bg-muted rounded-lg p-3 text-sm">正在思考中...</div>
            </div>
          </div>

          <SheetFooter class="pt-2">
            <div class="flex w-full gap-2">
              <Input
                v-model="aiInput"
                @keydown.enter="sendAiMessage"
                placeholder="输入你的口味..."
                :disabled="aiLoading" />
              <Button @click="sendAiMessage" size="icon" :disabled="aiLoading || !aiInput.trim()">
                <Send class="h-4 w-4" />
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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
