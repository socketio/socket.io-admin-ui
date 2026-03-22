<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    :elevation="0"
    class="border-r border-[rgba(var(--v-border-color),var(--v-border-opacity))] overflow-visible!"
  >
    <nav class="flex flex-col gap-0.5 px-3 pt-4">
      <router-link
        v-for="item in items"
        :key="item.title"
        v-slot="{ isActive, href, navigate }"
        :to="item.to"
        :exact="item.exact"
        custom
      >
        <a
          :href="href"
          :class="[
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium no-underline transition-all duration-150',
            isActive
              ? 'bg-primary/10 font-semibold text-[rgb(var(--v-theme-primary))]'
              : 'text-[rgba(var(--v-theme-on-surface),0.6)] hover:bg-[rgba(var(--v-theme-on-surface),0.04)] hover:text-[rgba(var(--v-theme-on-surface),0.85)]',
          ]"
          @click="navigate"
        >
          <div
            :class="[
              'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150',
              isActive
                ? 'bg-primary/15'
                : 'bg-[rgba(var(--v-theme-on-surface),0.05)] group-hover:bg-[rgba(var(--v-theme-on-surface),0.08)]',
            ]"
          >
            <v-icon :icon="item.icon" size="16" />
          </div>
          <span>{{ item.title }}</span>

          <div
            v-if="isActive"
            class="ml-auto h-5 w-[3px] rounded-full bg-[rgb(var(--v-theme-primary))]"
          />
        </a>
      </router-link>
    </nav>

    <!-- Bottom settings -->
    <template #append>
      <div class="border-t border-[rgba(var(--v-border-color),var(--v-border-opacity))]">
        <div class="px-5 pb-2 pt-5">
          <span class="text-[10px] font-semibold uppercase tracking-[0.08em] text-[rgba(var(--v-theme-on-surface),0.35)]">
            Settings
          </span>
        </div>

        <div class="flex flex-col gap-3 px-5 pb-5">
          <LangSelector />
          <ThemeToggle />
          <ReadonlyToggle />
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import LangSelector from "./LangSelector.vue";
import ThemeToggle from "./ThemeToggle.vue";
import ReadonlyToggle from "./ReadonlyToggle.vue";
import { useConfigStore } from "../stores/config";

const { t } = useI18n();
const configStore = useConfigStore();

const drawerOpen = computed({
  get: () => configStore.showNavigationDrawer,
  set: (v) => { configStore.showNavigationDrawer = v; },
});

const items = computed(() => {
  const base = [
    { title: t("dashboard.title"), icon: "mdi-view-dashboard-outline", to: { name: "dashboard" }, exact: true },
    { title: t("servers.title"), icon: "mdi-server-outline", to: { name: "servers" } },
  ];

  if (!configStore.developmentMode) return base;

  return [
    base[0],
    { title: t("sockets.title"), icon: "mdi-ray-start-arrow", to: { name: "sockets" } },
    { title: t("rooms.title"), icon: "mdi-tag-outline", to: { name: "rooms" } },
    { title: t("clients.title"), icon: "mdi-account-circle-outline", to: { name: "clients" } },
    { title: t("events.title"), icon: "mdi-calendar-text-outline", to: { name: "events" } },
    base[1],
  ];
});
</script>