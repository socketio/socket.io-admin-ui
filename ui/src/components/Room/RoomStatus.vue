<template>
  <Status
    :value="active"
    :ok-label="$t('rooms.active')"
    :ko-label="$t('rooms.deleted')"
  />
</template>

<script>
import Status from "../Status";

export default {
  name: "RoomStatus",

  components: { Status },

  props: {
    active: Boolean,
  },
};
</script>
