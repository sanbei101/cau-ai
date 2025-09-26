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
        <div class="mt-3 flex items-center">
          <div class="flex-grow">
            <p v-if="device.finishTime">
              剩余时间：{{ getCountdown(device.finishTime, currentTime) }}
            </p>
          </div>
          <Badge :variant="isReservationSupported(device) ? 'default' : 'outline'">
            {{ isReservationSupported(device) ? '可预约' : '不可预约' }}
          </Badge>
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
import { ref, reactive, onUnmounted } from 'vue';
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
import {
  GetLaundry,
  type payload,
  type DeviceItem,
  isReservationSupported,
  getCountdown,
  getStateText,
  getBadgeVariant
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

const fetchData = async () => {
  if (!form.positionId || !form.floorCode) return;

  loading.value = true;
  try {
    const res = await GetLaundry(form);
    devices.value = res.data.items;
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
