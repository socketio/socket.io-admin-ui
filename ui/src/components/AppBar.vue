<template>
  <v-app-bar
    :height="60"
    flat
    class="border-b border-[rgba(var(--v-border-color),var(--v-border-opacity))]"
  >
    <!-- Mobile nav toggle -->
    <v-app-bar-nav-icon
      class="lg:hidden"
      @click="configStore.toggleNavigationDrawer()"
    />

    <!-- Logo + Title -->
    <div class="flex items-center gap-3 pl-2">
      <div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
        <v-img :src="logoSrc" alt="logo" :height="22" :width="22" />
      </div>
      <div class="hidden items-baseline gap-2 sm:flex">
        <span class="text-sm font-semibold tracking-tight">
          Socket.IO
        </span>
        <span class="text-xs font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
          Admin UI
        </span>
      </div>
      <a
      :href="releaseNotesLink"
      target="_blank"
      rel="noopener"
      class="inline-flex items-center rounded-full border border-[rgba(var(--v-border-color),var(--v-border-opacity))] px-2.5 py-0.5 text-[10px] font-semibold text-[rgba(var(--v-theme-on-surface),0.5)] transition-colors hover:border-[rgba(var(--v-theme-primary),0.3)] hover:text-[rgb(var(--v-theme-primary))]"
    >
      v{{ version }}
    </a>
    </div>

    <v-spacer />

    <!-- Connection info — desktop only -->
    <div class="hidden items-center gap-5 lg:flex pr-2">
      <div class="flex items-center gap-3">
        <div class="flex flex-col items-end gap-0.5">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-medium text-[rgba(var(--v-theme-on-surface),0.45)]">
              {{ connectionStore.serverUrl || "—" }}
            </span>
          </div>
          <ConnectionStatus :connected="connectionStore.connected" />
        </div>
      </div>

      <div class="h-6 w-px bg-[rgba(var(--v-border-color),var(--v-border-opacity))]" />

      <v-btn
        variant="tonal"
        size="small"
        color="primary"
        class="text-xs! font-semibold! tracking-normal!"
        @click="$emit('update')"
      >
        <v-icon icon="mdi-refresh" size="14" class="mr-1" />
        {{ $t("update") }}
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script setup>
import { computed } from "vue";
import ConnectionStatus from "./ConnectionStatus.vue";
import { useConfigStore } from "../stores/config";
import { useConnectionStore } from "../stores/connection";
import darkLogo from "../assets/logo-dark.svg";
import lightLogo from "../assets/logo-light.svg";

defineEmits(["update"]);

const configStore = useConfigStore();
const connectionStore = useConnectionStore();

const version = __APP_VERSION__;
const releaseNotesLink = `https://github.com/socketio/socket.io-admin-ui/releases/tag/${version}`;
const logoSrc = computed(() => (configStore.darkTheme ? darkLogo : lightLogo));
</script>