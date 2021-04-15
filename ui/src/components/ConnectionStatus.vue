<template>
  <Status
    :value="connected"
    :ok-label="$t('connected')"
    :ko-label="$t('disconnected')"
  />
</template>

<script>
import Status from "./Status";

export default {
  name: "ConnectionStatus",

  components: { Status },

  props: {
    connected: Boolean,
  },
};
</script>
