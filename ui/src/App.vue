<template>
  <v-app>
    <AppBar @update="showConnectionModal = true" />
    <NavigationDrawer />

    <v-main :class="backgroundClass">
      <v-container fluid>
        <router-view v-slot="{ Component, route: activeRoute }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="activeRoute.fullPath" />
          </Transition>
        </router-view>
      </v-container>
    </v-main>

    <ConnectionModal
      :is-open="showConnectionModal"
      :initial-server-url="connectionStore.serverUrl"
      :initial-ws-only="connectionStore.wsOnly"
      :initial-path="connectionStore.path"
      :initial-namespace="connectionStore.namespace"
      :initial-parser="connectionStore.parser"
      :is-connecting="isConnecting"
      :error="connectionError"
      @submit="onSubmit"
      @close="showConnectionModal = false"
    />
  </v-app>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useDisplay, useTheme } from "vuetify";
import AppBar from "./components/AppBar.vue";
import NavigationDrawer from "./components/NavigationDrawer.vue";
import ConnectionModal from "./components/ConnectionModal.vue";
import { useAdminSocket } from "./composables/useAdminSocket";
import { useConfigStore } from "./stores/config";
import { useConnectionStore } from "./stores/connection";

const route = useRoute();
const { lgAndUp } = useDisplay();
const theme = useTheme();
const configStore = useConfigStore();
const connectionStore = useConnectionStore();
const { connect, isConnecting, connectionError } = useAdminSocket();

const showConnectionModal = ref(false);
const transitionName = ref("slide-x-reverse");

const backgroundClass = computed(() => {
  return configStore.darkTheme ? "" : "bg-grey-lighten-4";
});

watch(
  () => configStore.darkTheme,
  (dark) => {
    theme.change(dark ? "dark" : "light")
  },
  { immediate: true },
);

watch(
  () => connectionError.value,
  (value) => {
    if (value) {
      showConnectionModal.value = true;
    }
  },
);

watch(
  () => route.fullPath,
  () => {
    transitionName.value = route.meta.topLevel ? "slide-y-reverse" : "slide-x-reverse";
  },
);

function onSubmit(form) {
  connect({
    serverUrl: form.serverUrl,
    namespace: form.namespace,
    auth: {
      username: form.username,
      password: form.password,
      sessionId: connectionStore.sessionId || undefined,
    },
    wsOnly: form.wsOnly,
    path: form.path,
    parser: form.parser,
  });
  showConnectionModal.value = false;
}

onMounted(() => {
  if (lgAndUp.value && !configStore.showNavigationDrawer) {
    configStore.toggleNavigationDrawer();
  }
  if (connectionStore.serverUrl) {
    connect({
      serverUrl: connectionStore.serverUrl,
      namespace: connectionStore.namespace,
      auth: { sessionId: connectionStore.sessionId },
      wsOnly: connectionStore.wsOnly,
      path: connectionStore.path,
      parser: connectionStore.parser,
    });
    return;
  }
  showConnectionModal.value = true;
});
</script>

<style scoped>
.slide-x-enter-active,
.slide-x-leave-active,
.slide-x-reverse-enter-active,
.slide-x-reverse-leave-active,
.slide-y-enter-active,
.slide-y-leave-active,
.slide-y-reverse-enter-active,
.slide-y-reverse-leave-active {
  transition: all 0.2s ease;
}

.slide-x-enter-from,
.slide-x-reverse-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

.slide-x-leave-to,
.slide-x-reverse-enter-from {
  opacity: 0;
  transform: translateX(-18px);
}

.slide-y-enter-from,
.slide-y-reverse-leave-to {
  opacity: 0;
  transform: translateY(18px);
}

.slide-y-leave-to,
.slide-y-reverse-enter-from {
  opacity: 0;
  transform: translateY(-18px);
}
</style>
