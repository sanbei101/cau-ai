<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar';

import { Bot, Frame, GalleryVerticalEnd, Map, PieChart, SquareTerminal } from 'lucide-vue-next';
import NavMain from '@/components/NavMain.vue';
import NavProjects from '@/components/NavProjects.vue';
import NavUser from '@/components/NavUser.vue';
import TeamSwitcher from '@/components/TeamSwitcher.vue';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
});

// 示例数据
const data = {
  user: {
    name: 'CAU',
    email: 'student@cau.edu.cn',
    avatar: 'example.png'
  },
  teams: [
    {
      name: '农大AI平台',
      logo: GalleryVerticalEnd,
      plan: 'AI'
    }
  ],
  navMain: [
    {
      title: '生活便利',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: '洗衣',
          url: '/laundry'
        },
        {
          title: '食堂',
          url: '/food'
        },
        {
          title: '快递',
          url: '#'
        }
      ]
    },
    {
      title: '课程学习',
      url: '#',
      icon: Bot,
      items: [
        {
          title: '查成绩',
          url: '#'
        },
        {
          title: '课标',
          url: '#'
        },
        {
          title: '地点查询',
          url: '#'
        }
      ]
    }
  ],
  projects: [
    {
      name: '资料下载',
      url: '#',
      icon: Frame
    },
    {
      name: '选课助手',
      url: '#',
      icon: PieChart
    },
    {
      name: '常识集合',
      url: '#',
      icon: Map
    }
  ]
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
