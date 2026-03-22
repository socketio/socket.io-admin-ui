<template>
  <v-dialog :model-value="isOpen" max-width="460" persistent>
    <div
      class="relative overflow-hidden rounded-2xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgb(var(--v-theme-surface))]">
      <!-- Header -->
      <div class="px-7 pt-7 pb-1">
        <div class="mb-1 flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <v-icon icon="mdi-connection" size="20" color="primary" />
          </div>
          <div>
            <h2 class="text-base font-semibold tracking-tight my-0">
              {{ $t("connection.title") }}
            </h2>
            <p class="text-[11px] font-medium text-[rgba(var(--v-theme-on-surface),0.45)] my-0">
              {{ $t("connection.serverUrl") }}
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form class="px-7 pt-4 pb-7" @submit.prevent="submit">
        <!-- Server URL -->
        <div class="space-y-4">
          <div>
            <label
              class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]">
              {{ $t("connection.serverUrl") }}
            </label>
            <v-text-field v-model="serverUrl" placeholder="https://example.com" variant="outlined" density="compact"
              hide-details single-line />
          </div>

          <!-- Credentials row -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]">
                {{ $t("connection.username") }}
              </label>
              <v-text-field v-model="username" variant="outlined" density="compact" hide-details single-line />
            </div>
            <div>
              <label
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]">
                {{ $t("connection.password") }}
              </label>
              <v-text-field v-model="password" type="password" variant="outlined" density="compact" hide-details
                single-line />
            </div>
          </div>
        </div>

        <!-- Advanced toggle -->
        <button type="button"
          class="mt-5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.5)] transition-colors hover:bg-[rgba(var(--v-theme-on-surface),0.04)] hover:text-[rgba(var(--v-theme-on-surface),0.7)]"
          @click="showAdvanced = !showAdvanced">
          <v-icon :icon="showAdvanced ? 'mdi-chevron-down' : 'mdi-chevron-right'" size="16" />
          {{ $t("connection.advanced-options") }}
        </button>

        <!-- Advanced options -->
        <v-expand-transition>
          <div v-show="showAdvanced"
            class="mt-3 space-y-4 rounded-xl border border-[rgba(var(--v-border-color),var(--v-border-opacity))] bg-[rgba(var(--v-theme-on-surface),0.02)] p-4">
            <!-- WebSocket only -->
            <label class="flex cursor-pointer items-center justify-between rounded-lg px-1">
              <span class="text-xs font-medium">{{ $t("connection.websocket-only") }}</span>
              <v-switch v-model="wsOnly" inset hide-details density="compact" class="!mt-0 shrink-0" />
            </label>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label
                  class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]">
                  {{ $t("connection.path") }}
                </label>
                <v-text-field v-model="path" variant="outlined" density="compact" hide-details single-line />
              </div>
              <div>
                <label
                  class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]">
                  {{ $t("connection.namespace") }}
                </label>
                <v-text-field v-model="namespace" variant="outlined" density="compact" hide-details single-line />
              </div>
            </div>

            <div>
              <label
                class="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-[rgba(var(--v-theme-on-surface),0.4)]">
                {{ $t("connection.parser") }}
              </label>
              <v-select v-model="parser" :items="parserOptions" item-title="title" item-value="value" variant="outlined"
                density="compact" hide-details />
            </div>
          </div>
        </v-expand-transition>

        <div v-if="errorMessage"
          class="mt-4 flex items-center justify-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
          <v-icon icon="mdi-alert-circle-outline" size="16" class="mt-0.5 shrink-0 text-red-500" />
          <span class="text-xs font-medium text-red-400">{{ errorMessage }}</span>
        </div>

        <v-btn type="submit" :loading="isConnecting" :disabled="!serverUrl" block color="primary"
          class="!mt-6 !rounded-xl !text-sm !font-semibold !tracking-tight" height="44">
          <v-icon icon="mdi-arrow-right" size="16" class="mr-1.5" />
          {{ $t("connection.connect") }}
        </v-btn>
      </form>
    </div>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  isOpen: Boolean,
  initialServerUrl: String,
  initialWsOnly: Boolean,
  initialPath: String,
  initialNamespace: String,
  initialParser: String,
  isConnecting: Boolean,
  error: String,
});

const emit = defineEmits(["submit"]);
const { t } = useI18n();

const serverUrl = ref("");
const username = ref("");
const password = ref("");
const wsOnly = ref(false);
const path = ref("/socket.io");
const namespace = ref("/admin");
const parser = ref("default");
const showAdvanced = ref(false);

const parserOptions = [
  { title: "Default", value: "default" },
  { title: "MessagePack", value: "msgpack" },
];

const errorMessage = computed(() => {
  if (!props.error) return "";
  if (props.error === "invalid credentials") {
    return t("connection.invalid-credentials");
  }
  return `${t("connection.error")}${t("separator")}${props.error}`;
});

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;
    serverUrl.value = props.initialServerUrl || "";
    wsOnly.value = props.initialWsOnly || false;
    path.value = props.initialPath || "/socket.io";
    namespace.value = props.initialNamespace || "/admin";
    parser.value = props.initialParser || "default";
  },
  { immediate: true },
);

function submit() {
  emit("submit", {
    serverUrl: serverUrl.value,
    username: username.value,
    password: password.value,
    wsOnly: wsOnly.value,
    path: path.value,
    namespace: namespace.value,
    parser: parser.value,
  });
}
</script>