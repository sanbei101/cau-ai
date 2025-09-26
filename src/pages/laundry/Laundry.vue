<template>
  <div class="p-6 space-y-6">
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex-1 min-w-[200px] flex items-center gap-2">
        <Label for="position">地点</Label>
        <Select v-model="form.positionId" @update:model-value="handlePositionChange">
          <SelectTrigger id="position">
            <SelectValue placeholder="请选择地点" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="pos in positions" :key="pos.id" :value="pos.id">
              {{ pos.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex-1 min-w-[200px] flex items-center gap-2">
        <Label for="floor">楼层</Label>
        <Select v-model="form.floorCode" @update:model-value="fetchData">
          <SelectTrigger id="floor">
            <SelectValue placeholder="请选择楼层" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="floor in floors" :key="floor.code" :value="floor.code">
              {{ floor.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button @click="fetchData" :disabled="!form.positionId || !form.floorCode"> 查询 </Button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <Loader class="h-6 w-6 animate-spin" />
      <span class="ml-2">加载中...</span>
    </div>

    <div
      v-else-if="devices.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="device in devices" :key="device.id" class="p-4">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold">{{ device.name }}</h3>
            <p class="text-sm text-muted-foreground">IMEI: {{ device.imei }}</p>
            <p class="text-sm">设备ID: {{ device.deviceId }}</p>
          </div>
          <Badge :variant="getBadgeVariant(device.state)">
            {{ getStateText(device.state) }}
          </Badge>
        </div>
        <div class="mt-3 text-sm">
          <p>预约功能：{{ isReservationSupported(device) ? '支持' : '不支持' }}</p>
          <p v-if="device.finishTime">预计完成：{{ formatTime(device.finishTime) }}</p>
        </div>
      </Card>
    </div>

    <div
      v-else-if="!loading && form.positionId && form.floorCode"
      class="text-center py-8 text-muted-foreground">
      未找到设备
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Loader } from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { GetLaundry, type payload, type DeviceItem, isReservationSupported } from '@/api/laundry';

const positions = [
  { id: 27958, name: '东校区三号公寓' },
  { id: 27956, name: '东校区一号公寓A座' },
  { id: 27957, name: '东校区一号公寓B座' }
];

const floors = Array.from({ length: 18 }, (_, i) => ({
  code: String(i + 1).padStart(2, '0'),
  name: `${i + 1}楼`
}));

const form = ref<payload>({
  positionId: 0,
  floorCode: '00',
  categoryCode: '00',
  page: 1,
  pageSize: 100
});

const devices = ref<DeviceItem[]>([]);
const loading = ref(false);

const getStateText = (state: number): string => {
  switch (state) {
    case 1:
      return '空闲';
    case 2:
      return '运行中';
    default:
      return '未知状态';
  }
};

const getBadgeVariant = (state: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (state === 0) return 'secondary';
  if (state === 1) return 'default';
  if (state === 2) return 'destructive';
  return 'outline';
};

const formatTime = (timeStr: string | null): string => {
  if (!timeStr) return '';
  return new Date(timeStr).toLocaleString('zh-CN');
};

const handlePositionChange = () => {
  form.value.floorCode = '00';
  devices.value = [];
};

const fetchData = async () => {
  if (!form.value.positionId || !form.value.floorCode) return;

  loading.value = true;
  try {
    const res = await GetLaundry(form.value);
    devices.value = res.data.items;
  } catch (error) {
    console.error('获取设备失败:', error);
    devices.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {});
</script>
