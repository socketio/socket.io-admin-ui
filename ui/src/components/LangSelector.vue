<template>
  <div class="relative" ref="containerRef">
    <button
      class="flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[rgba(var(--v-theme-on-surface),0.04)]"
      @click="open = !open"
    >
      <div class="flex items-center gap-2.5">
        <v-icon
          icon="mdi-translate"
          size="16"
          class="text-[rgba(var(--v-theme-on-surface),0.5)]"
        />
        <span class="text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.6)]">
          {{ currentLabel }}
        </span>
      </div>
      <v-icon
        icon="mdi-chevron-down"
        size="14"
        :class="[
          'text-[rgba(var(--v-theme-on-surface),0.35)] transition-transform duration-200',
          open && 'rotate-180',
        ]"
      />
    </button>

    <!-- Dropdown — opens upward, uses fixed positioning to escape overflow -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <div
          v-if="open"
          ref="dropdownRef"
          class="fixed z-[9999] max-h-72 w-52 origin-bottom-left overflow-y-auto rounded-xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))] py-1 shadow-lg"
          :style="dropdownStyle"
        >
          <button
            v-for="lang in languages"
            :key="lang.value"
            :class="[
              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors',
              lang.value === currentValue
                ? 'bg-primary/8 font-semibold text-[rgb(var(--v-theme-primary))]'
                : 'text-[rgba(var(--v-theme-on-surface),0.65)] hover:bg-[rgba(var(--v-theme-on-surface),0.04)]',
            ]"
            @click="select(lang.value)"
          >
            <span>{{ lang.text }}</span>
            <v-icon
              v-if="lang.value === currentValue"
              icon="mdi-check"
              size="14"
              class="ml-auto"
            />
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useConfigStore } from "../stores/config";

const configStore = useConfigStore();
const i18n = useI18n();

const languages = [
  { text: "বাংলা", value: "bn" },
  { text: "English", value: "en" },
  { text: "Français", value: "fr" },
  { text: "한국어", value: "ko" },
  { text: "Português (BR)", value: "pt-BR" },
  { text: "Türkçe", value: "tr" },
  { text: "简体中文", value: "zh-CN" },
];

const open = ref(false);
const containerRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = reactive({ top: "0px", left: "0px" });

function updatePosition() {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  // Position above the trigger button
  dropdownStyle.left = `${rect.left}px`;
  dropdownStyle.top = `${rect.top - 4}px`;
  dropdownStyle.transform = "translateY(-100%)";
}

watch(open, async (val) => {
  if (val) {
    await nextTick();
    updatePosition();
  }
});

const currentValue = computed(() => configStore.lang);
const currentLabel = computed(
  () => languages.find((l) => l.value === currentValue.value)?.text ?? "English",
);

function select(value) {
  configStore.selectLang(value);
  open.value = false;
}

function onClickOutside(e) {
  if (
    containerRef.value && !containerRef.value.contains(e.target) &&
    dropdownRef.value && !dropdownRef.value.contains(e.target)
  ) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("pointerdown", onClickOutside));
onUnmounted(() => document.removeEventListener("pointerdown", onClickOutside));

watch(
  () => configStore.lang,
  (v) => { i18n.locale.value = v; },
  { immediate: true },
);
</script>