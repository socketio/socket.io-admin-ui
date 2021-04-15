<template>
  <Status
    :value="!isPrivate"
    :ok-label="$t('rooms.public')"
    :ko-label="$t('rooms.private')"
  />
</template>

<script>
import Status from "../Status";

export default {
  name: "RoomType",

  components: { Status },

  props: {
    isPrivate: Boolean,
  },
};
</script>
