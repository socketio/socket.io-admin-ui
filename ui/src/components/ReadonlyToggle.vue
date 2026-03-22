<template>
  <button
    :disabled="disabled"
    :class="[
      'group flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors',
      disabled
        ? 'cursor-not-allowed opacity-40'
        : 'hover:bg-[rgba(var(--v-theme-on-surface),0.04)]',
    ]"
    @click="toggle"
  >
    <div class="flex items-center gap-2.5">
      <v-icon
        :icon="readonly ? 'mdi-lock-outline' : 'mdi-lock-open-variant-outline'"
        size="16"
        class="text-[rgba(var(--v-theme-on-surface),0.5)]"
      />
      <span class="text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.6)]">
        {{ $t("config.readonly") }}
      </span>
    </div>

    <!-- Pill toggle -->
    <div
      :class="[
        'relative h-5 w-9 rounded-full transition-colors duration-200',
        readonly ? 'bg-amber-500' : 'bg-[rgba(var(--v-theme-on-surface),0.15)]',
      ]"
    >
      <div
        :class="[
          'absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-[left] duration-200',
          readonly ? 'left-[18px]' : 'left-0.5',
        ]"
      />
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useConfigStore } from "../stores/config";

const configStore = useConfigStore();
const disabled = computed(() => configStore.supportedFeatures.length === 0);
const readonly = computed(() => configStore.readonly);

function toggle() {
  if (!disabled.value) configStore.toggleReadonly();
}
</script>