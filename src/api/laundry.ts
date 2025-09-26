import alaovaInstance from '@/api/alova';

const apiUrl = 'https://yshz-user.haier-ioc.com/position/deviceDetailPage';
type DeviceItem = {
  id: number;
  name: string;
  imei: string;
  floorCode: string;
  state: number;
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

export { GetLaundry };
