<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

const props = defineProps({
  isOpen: Boolean,
  isConnecting: Boolean,
  initialServerUrl: String,
  initialWsOnly: Boolean,
  initialPath: String,
  initialNamespace: String,
  initialParser: String,
  error: String,
});

const emit = defineEmits(["submit"]);

const { t } = useI18n();

const showAdvancedOptions = ref(false);
const serverUrl = ref(props.initialServerUrl);
const wsOnly = ref(props.initialWsOnly);
const path = ref(props.initialPath);
const namespace = ref(props.initialNamespace);
const username = ref("");
const password = ref("");
const parser = ref(props.initialParser);

const parserOptions = [
  {
    value: "default",
    title: t("connection.default-parser"),
  },
  {
    value: "msgpack",
    title: t("connection.msgpack-parser"),
  },
];

const isValid = computed(() => serverUrl.value && serverUrl.value.length);

const errorMessage = computed(() => {
  return props.error === "invalid credentials"
    ? t("connection.invalid-credentials")
    : t("connection.error") + t("separator") + props.error;
});

const onSubmit = () => {
  emit("submit", {
    serverUrl: serverUrl.value,
    wsOnly: wsOnly.value,
    path: path.value,
    namespace: namespace.value,
    username: username.value,
    password: password.value,
    parser: parser.value,
  });
};
</script>

<template>
  <v-dialog
    :model-value="isOpen"
    transition="dialog-bottom-transition"
    max-width="300"
    persistent
  >
    <v-card>
      <v-card-title>{{ $t("connection.title") }}</v-card-title>
      <v-card-text>
        <form @submit.prevent="onSubmit">
          <v-text-field
            v-model="serverUrl"
            :label="$t('connection.serverUrl')"
            placeholder="https://example.com"
            required
          ></v-text-field>
          <v-text-field
            v-model="username"
            :label="$t('connection.username')"
          ></v-text-field>
          <v-text-field
            v-model="password"
            :label="$t('connection.password')"
            type="password"
          ></v-text-field>

          <v-switch
            v-model="showAdvancedOptions"
            :label="$t('connection.advanced-options')"
            inset
            dense
          />

          <v-expand-transition>
            <div v-if="showAdvancedOptions">
              <v-switch
                v-model="wsOnly"
                :label="$t('connection.websocket-only')"
                inset
                density="compact"
                v-show="showAdvancedOptions"
              />

              <v-text-field
                v-model="namespace"
                :label="$t('connection.namespace')"
              ></v-text-field>

              <v-text-field
                v-model="path"
                :label="$t('connection.path')"
              ></v-text-field>

              <v-select
                v-model="parser"
                :label="$t('connection.parser')"
                :items="parserOptions"
              />
            </div>
          </v-expand-transition>

          <v-btn
            :loading="isConnecting"
            :disabled="isConnecting || !isValid"
            type="submit"
            color="primary"
            >{{ $t("connection.connect") }}</v-btn
          >
          <div v-if="error" class="text-red mt-3">
            {{ errorMessage }}
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
