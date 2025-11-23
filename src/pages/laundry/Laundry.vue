<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <WashingMachine class="h-8 w-8 text-primary" />
        <h1 class="text-3xl font-bold">洗衣房设备查询</h1>
      </div>
      <p class="text-muted-foreground">选择地点和楼层来查看可用的洗衣设备</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <!-- AI Sidebar -->
      <div class="lg:col-span-1 lg:col-start-4 row-start-1 row-end-1">
        <div class="sticky top-6">
          <Card class="flex flex-col h-[600px] border-primary/20 shadow-md">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Bot class="h-5 w-5" />
                AI 洗衣助手
              </CardTitle>
              <CardDescription> 哪台机器空闲？问问我吧！ </CardDescription>
            </CardHeader>
            <CardContent class="flex-1 p-0 overflow-hidden">
              <ScrollArea class="h-full p-4" id="ai-chat-scroll-area">
                <div class="space-y-4">
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
                        'rounded-lg p-3 text-sm max-w-[85%]',
                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      ]">
                      {{ msg.content }}
                    </div>
                  </div>
                  <div v-if="aiLoading" class="flex gap-3">
                    <div
                      class="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Bot class="h-5 w-5" />
                    </div>
                    <div class="bg-muted rounded-lg p-3 text-sm">正在思考中...</div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
            <div class="p-4 border-t bg-background">
              <div class="flex flex-col gap-2">
                <Textarea
                  v-model="aiInput"
                  @keydown.enter.prevent="sendAiMessage"
                  placeholder="输入你的问题..."
                  :disabled="aiLoading"
                  class="min-h-20 resize-none" />
                <Button
                  @click="sendAiMessage"
                  class="w-full"
                  :disabled="aiLoading || !aiInput.trim()">
                  <Send class="h-4 w-4 mr-2" />
                  发送
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-6">
        <Card class="p-6">
          <CardHeader class="px-0 pt-0 pb-4">
            <CardTitle class="text-xl flex items-center gap-2">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              设备筛选
            </CardTitle>
            <CardDescription> 选择地点和楼层来查看可用的洗衣设备 </CardDescription>
          </CardHeader>
          <CardContent class="px-0 pb-0">
            <div class="flex flex-wrap gap-4 items-end">
              <div class="flex-1 min-w-[200px] space-y-2">
                <Label for="position" class="text-sm font-medium">地点</Label>
                <Select v-model="form.positionId" @update:model-value="handlePositionChange">
                  <SelectTrigger id="position" class="w-full">
                    <SelectValue placeholder="请选择地点" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="pos in positions" :key="pos.id" :value="pos.id">
                      {{ pos.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="flex-1 min-w-[200px] space-y-2">
                <Label for="floor" class="text-sm font-medium">楼层</Label>
                <Select v-model="form.floorCode" @update:model-value="fetchData">
                  <SelectTrigger id="floor" class="w-full">
                    <SelectValue placeholder="请选择楼层" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="floor in floors" :key="floor.code" :value="floor.code">
                      {{ floor.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                @click="fetchData"
                :disabled="!form.positionId || !form.floorCode"
                class="px-6">
                查询设备
              </Button>
            </div>
          </CardContent>
        </Card>

        <div v-if="loading" class="flex flex-col items-center justify-center py-12 space-y-4">
          <Card class="p-8 flex flex-col items-center space-y-4 border-dashed">
            <Loader class="h-8 w-8 animate-spin text-primary" />
            <div class="text-center space-y-2">
              <p class="text-lg font-medium">正在查询设备信息</p>
              <p class="text-sm text-muted-foreground">请稍候...</p>
            </div>
          </Card>
        </div>

        <div v-if="devices.length > 0 && !loading" class="space-y-6">
          <!-- 统计卡片 -->
          <div class="grid grid-cols-4 gap-4">
            <Card
              class="text-center border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/30 dark:border-zinc-800">
              <CardContent class="p-1">
                <div class="text-2xl font-bold text-zinc-700 dark:text-zinc-400">
                  {{ deviceStats.total }}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-300">总设备数</div>
              </CardContent>
            </Card>
            <Card
              class="text-center border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/30 dark:border-zinc-800">
              <CardContent class="p-1">
                <div class="text-2xl font-bold text-zinc-700 dark:text-zinc-400">
                  {{ deviceStats.available }}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-300">可用设备</div>
              </CardContent>
            </Card>
            <Card
              class="text-center border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/30 dark:border-zinc-800">
              <CardContent class="p-1">
                <div class="text-2xl font-bold text-zinc-700 dark:text-zinc-400">
                  {{ deviceStats.inUse }}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-300">使用中</div>
              </CardContent>
            </Card>
            <Card
              class="text-center border-zinc-200 bg-zinc-50/50 dark:bg-zinc-950/30 dark:border-zinc-800">
              <CardContent class="p-1">
                <div class="text-2xl font-bold text-zinc-700 dark:text-zinc-400">
                  {{ deviceStats.reserved }}
                </div>
                <div class="text-sm text-zinc-600 dark:text-zinc-300">已预约</div>
              </CardContent>
            </Card>
          </div>

          <!-- 设备列表 -->
          <div class="space-y-4">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <div class="w-2 h-2 bg-primary rounded-full"></div>
              设备列表
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                v-for="device in devices"
                :key="device.id"
                class="hover:shadow-md transition-shadow duration-200">
                <CardHeader class="pb-3">
                  <div class="flex justify-between items-start">
                    <CardTitle class="text-lg">{{ device.name }}</CardTitle>
                    <Badge :variant="getBadgeVariant(device.state)" class="ml-2">
                      {{ getStateText(device.state) }}
                    </Badge>
                  </div>
                  <CardDescription class="text-sm">
                    IMEI: {{ device.imei }} | 设备ID: {{ device.deviceId }}
                  </CardDescription>
                </CardHeader>
                <CardContent class="pt-0">
                  <div class="space-y-3">
                    <div
                      v-if="device.finishTimeTimestamp"
                      class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span class="text-sm font-medium">剩余时间</span>
                      </div>
                      <span class="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {{ getCountdown(device.finishTimeTimestamp, currentTime) }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between pt-2 border-t">
                      <span class="text-sm text-muted-foreground">预约状态</span>
                      <Badge
                        :variant="isReservationSupported(device) ? 'default' : 'secondary'"
                        class="text-xs">
                        {{ isReservationSupported(device) ? '可预约' : '不可预约' }}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Empty v-else-if="!loading && form.positionId && form.floorCode" class="max-w-md mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search class="h-12 w-12" />
            </EmptyMedia>
            <EmptyTitle>未找到设备</EmptyTitle>
            <EmptyDescription> 该楼层暂无可用设备，请尝试选择其他楼层或地点 </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, computed, nextTick } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader, Search, Bot, Send, User, WashingMachine } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import {
  GetLaundry,
  isReservationSupported,
  getCountdown,
  getStateText,
  getBadgeVariant,
  type payload,
  type DeviceItem
} from '@/api/laundry';
import { client } from '@/api/opeai';

const positions = [
  { id: 27958, name: '东校区三号公寓' },
  { id: 27956, name: '东校区一号公寓A座' },
  { id: 27957, name: '东校区一号公寓B座' }
];

const floors = Array.from({ length: 18 }, (_, i) => ({
  code: String(i + 1).padStart(2, '0'),
  name: `${i + 1}楼`
}));

const form = reactive<payload>({
  positionId: 0,
  floorCode: '00',
  categoryCode: '00',
  page: 1,
  pageSize: 100
});

const devices = ref<DeviceItem[]>([]);
const loading = ref(false);
const currentTime = ref(Date.now());
const interval = setInterval(() => (currentTime.value = Date.now()), 1000);
const handlePositionChange = () => {
  form.floorCode = '00';
  devices.value = [];
};

const deviceStats = computed(() => {
  if (devices.value.length === 0) return { total: 0, available: 0, inUse: 0, reserved: 0 };

  const stats = {
    total: devices.value.length,
    available: 0,
    inUse: 0,
    reserved: 0
  };

  devices.value.forEach((device) => {
    if (device.state === 1) stats.available++;
    else if (device.state === 2) stats.inUse++;
    else stats.reserved++;
  });

  return stats;
});

// AI Chat Logic
const aiInput = ref('');
const aiMessages = ref<{ role: 'user' | 'assistant'; content: string }[]>([
  {
    role: 'assistant',
    content: '你好！我是你的洗衣房助手。想知道哪台机器空闲吗？或者想知道还要等多久？问我吧！'
  }
]);
const aiLoading = ref(false);

const scrollToBottom = async () => {
  await nextTick();
  const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight;
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
    const locationName = positions.find((p) => p.id === form.positionId)?.name || '未选择地点';
    const floorName = floors.find((f) => f.code === form.floorCode)?.name || '未选择楼层';

    let context = `当前查询位置: ${locationName} - ${floorName}\n`;
    if (devices.value.length === 0) {
      context += '当前列表为空,可能是未查询或该区域无设备';
    } else {
      context += '设备状态列表:\n';
      context += devices.value
        .map((d) => {
          const status = getStateText(d.state);
          const timeInfo = d.finishTimeTimestamp
            ? ` (预计剩余: ${getCountdown(d.finishTimeTimestamp, currentTime.value)})`
            : '';
          return `- ${d.name} (ID: ${d.deviceId}): ${status}${timeInfo}`;
        })
        .join('\n');
    }

    const response = await client.chat.completions.create({
      model: 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        {
          role: 'system',
          content: `你是一个大学洗衣房助手。
          
          以下是当前查询到的设备状态：
          ${context}
          
          请根据用户的输入回答问题。
          如果用户询问可用设备，请列出空闲的机器。
          如果用户询问等待时间，请根据剩余时间回答。
          回答要简洁、实用。
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

const fetchData = async () => {
  if (!form.positionId || !form.floorCode) return;
  loading.value = true;
  try {
    const res = await GetLaundry(form);
    devices.value = res.data.items.map((item) => ({
      ...item,
      finishTimeTimestamp: item.finishTime ? new Date(item.finishTime).getTime() : null
    }));
  } catch (error) {
    console.error('获取设备失败:', error);
    devices.value = [];
  } finally {
    loading.value = false;
  }
};
onUnmounted(() => {
  clearInterval(interval);
});
</script>
