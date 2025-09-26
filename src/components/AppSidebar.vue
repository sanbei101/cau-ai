<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar";

import {
  BookOpen,
  Bot,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-vue-next";
import NavMain from "@/components/NavMain.vue";
import NavProjects from "@/components/NavProjects.vue";
import NavUser from "@/components/NavUser.vue";
import TeamSwitcher from "@/components/TeamSwitcher.vue";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
});

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "农大AI平台",
      logo: GalleryVerticalEnd,
      plan: "AI",
    },
  ],
  navMain: [
    {
      title: "生活便利",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "洗衣",
          url: "#",
        },
        {
          title: "食堂",
          url: "#",
        },
        {
          title: "快递",
          url: "#",
        },
      ],
    },
    {
      title: "课程学习",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "查成绩",
          url: "#",
        },
        {
          title: "课标",
          url: "#",
        },
        {
          title: "地点查询",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "资料下载",
      url: "#",
      icon: Frame,
    },
    {
      name: "选课助手",
      url: "#",
      icon: PieChart,
    },
    {
      name: "常识集合",
      url: "#",
      icon: Map,
    },
  ],
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
