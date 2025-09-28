import alaovaInstance from '@/api/alova';

const apiUrl = 'https://yshz-user.haier-ioc.com/position/deviceDetailPage';
type DeviceItem = {
  id: number;
  name: string;
  imei: string;
  floorCode: string;
  state: number;
  reserveState: number;
  enableReserve: boolean;
  finishTime: string | null;
  deviceId: number;
};

type DeviceResponse = {
  code: number;
  message: string;
  data: {
    page: number;
    pageSize: number;
    total: number;
    items: DeviceItem[];
  };
};

type payload = {
  positionId: number;
  categoryCode: string;
  page: number;
  floorCode: string;
  pageSize: number;
};

async function GetLaundry(payload: payload) {
  const res = await alaovaInstance.Post<DeviceResponse>(apiUrl, payload);
  if (res.message !== 'success') {
    throw new Error('Failed to fetch laundry data');
  }
  return res;
}

function isReservationSupported(device: DeviceItem): boolean {
  return !(device.reserveState === 0 && device.state === 2);
}
const getCountdown = (finishTime: string, nowTime: number): string => {
  if (!finishTime) return '';
  const finish = new Date(finishTime).getTime();
  const now = nowTime;
  const diff = finish - now;
  if (diff <= 0) {
    return '已完成';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}小时${minutes}分${seconds}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${seconds}秒`;
  } else {
    return `${seconds}秒`;
  }
};
function getStateText(state: number): string {
  switch (state) {
    case 1:
      return '空闲';
    case 2:
      return '运行中';
    default:
      return '未知状态';
  }
}
function getBadgeVariant(state: number): 'default' | 'outline' {
  if (state === 1) return 'outline';
  if (state === 2) return 'default';
  return 'outline';
}
export {
  GetLaundry,
  type DeviceItem,
  type payload,
  isReservationSupported,
  getCountdown,
  getStateText,
  getBadgeVariant
};
