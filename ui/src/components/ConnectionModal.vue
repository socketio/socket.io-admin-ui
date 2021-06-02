<template>
  <v-dialog
    :value="isOpen"
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
            placeholder="https://example.com/admin"
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
            v-model="wsOnly"
            :label="$t('connection.websocket-only')"
            inset
            dense
          />

          <v-text-field
            v-model="path"
            :label="$t('connection.path')"
          ></v-text-field>

          <v-btn
            :loading="isConnecting"
            :disabled="isConnecting || !isValid"
            type="submit"
            class="primary"
            >{{ $t("connection.connect") }}</v-btn
          >
          <div v-if="error" class="red--text mt-3">
            {{ errorMessage }}
          </div>
        </form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "ConnectionModal",

  props: {
    isOpen: Boolean,
    isConnecting: Boolean,
    initialServerUrl: String,
    initialWsOnly: Boolean,
    initialPath: String,
    error: String,
  },

  data() {
    return {
      serverUrl: this.initialServerUrl,
      wsOnly: this.initialWsOnly,
      path: this.initialPath,
      username: "",
      password: "",
    };
  },

  computed: {
    isValid() {
      return this.serverUrl && this.serverUrl.length;
    },
    errorMessage() {
      return this.error === "invalid credentials"
        ? this.$t("connection.invalid-credentials")
        : this.$t("connection.error") + this.$t("separator") + this.error;
    },
  },

  methods: {
    onSubmit() {
      this.$emit("submit", {
        serverUrl: this.serverUrl,
        wsOnly: this.wsOnly,
        path: this.path,
        username: this.username,
        password: this.password,
      });
    },
  },
};
</script>

<style scoped></style>
