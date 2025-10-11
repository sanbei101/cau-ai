<template>
  <div class="p-6 space-y-6">
    <Card class="p-6">
      <CardHeader class="px-0 pt-0 pb-4">
        <CardTitle class="text-xl flex items-center gap-2">
          <div class="w-2 h-2 bg-primary rounded-full"></div>
          洗衣房设备查询
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

          <Button @click="fetchData" :disabled="!form.positionId || !form.floorCode" class="px-6">
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
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card class="text-center">
          <CardContent class="p-4">
            <div class="text-2xl font-bold text-primary">{{ deviceStats.total }}</div>
            <div class="text-sm text-muted-foreground">总设备数</div>
          </CardContent>
        </Card>
        <Card class="text-center border-green-200 bg-green-50/50">
          <CardContent class="p-4">
            <div class="text-2xl font-bold text-green-600">{{ deviceStats.available }}</div>
            <div class="text-sm text-green-700">可用设备</div>
          </CardContent>
        </Card>
        <Card class="text-center border-orange-200 bg-orange-50/50">
          <CardContent class="p-4">
            <div class="text-2xl font-bold text-orange-600">{{ deviceStats.inUse }}</div>
            <div class="text-sm text-orange-700">使用中</div>
          </CardContent>
        </Card>
        <Card class="text-center border-blue-200 bg-blue-50/50">
          <CardContent class="p-4">
            <div class="text-2xl font-bold text-blue-600">{{ deviceStats.reserved }}</div>
            <div class="text-sm text-blue-700">已预约</div>
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
                <div v-if="device.finishTimeTimestamp" class="flex items-center justify-between">
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
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, computed } from 'vue';
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
import { Loader, Search } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
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
