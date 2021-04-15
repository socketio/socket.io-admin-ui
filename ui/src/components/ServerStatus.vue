<template>
  <Status
    :value="healthy"
    :ok-label="$t('servers.healthy')"
    :ko-label="$t('servers.unhealthy')"
  />
</template>

<script>
import Status from "./Status";

export default {
  name: "ServerStatus",

  components: { Status },

  props: {
    healthy: Boolean,
  },
};
</script>
