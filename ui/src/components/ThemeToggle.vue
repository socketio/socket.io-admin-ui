<template>
  <button
    class="group flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[rgba(var(--v-theme-on-surface),0.04)]"
    @click="toggle"
  >
    <div class="flex items-center gap-2.5">
      <v-icon
        :icon="darkTheme ? 'mdi-weather-night' : 'mdi-white-balance-sunny'"
        size="16"
        class="text-[rgba(var(--v-theme-on-surface),0.5)]"
      />
      <span class="text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.6)]">
        {{ $t("config.dark-theme") }}
      </span>
    </div>

    <!-- Pill toggle -->
    <div
      :class="[
        'relative h-5 w-9 rounded-full transition-colors duration-200',
        darkTheme ? 'bg-primary' : 'bg-[rgba(var(--v-theme-on-surface),0.15)]',
      ]"
    >
      <div
        :class="[
          'absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] duration-200',
          darkTheme ? 'left-[18px]' : 'left-0.5',
        ]"
      />
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useConfigStore } from "../stores/config";

const configStore = useConfigStore();
const darkTheme = computed(() => configStore.darkTheme);

function toggle() {
  configStore.selectTheme(!darkTheme.value);
}
</script>