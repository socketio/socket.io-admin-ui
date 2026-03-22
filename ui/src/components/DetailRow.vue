<template>
  <div
    class="flex items-baseline justify-between gap-4 border-b border-[rgba(var(--v-border-color),calc(var(--v-border-opacity)*0.4))] px-5 py-2.5 last:border-b-0"
  >
    <dt
      class="shrink-0 text-[11px] font-medium uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]"
    >
      {{ label }}
    </dt>
    <dd class="text-right text-xs">
      <slot>
        <span v-if="mono" class="font-mono">{{ value ?? "—" }}</span>
        <span v-else>{{ value ?? "—" }}</span>
      </slot>
    </dd>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, default: null },
  mono: { type: Boolean, default: false },
});
</script>
