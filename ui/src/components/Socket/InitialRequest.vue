<script setup>
import KeyValueTable from "../KeyValueTable.vue";

defineProps({
  socket: Object,
});
</script>

<template>
  <v-card class="fill-height">
    <v-card-title>{{ $t("sockets.initial-request") }}</v-card-title>

    <v-card-text
      ><h4>{{ $t("sockets.headers") }}</h4></v-card-text
    >

    <KeyValueTable :object="socket.handshake.headers" />

    <v-card-text
      ><h4>{{ $t("sockets.query-params") }}</h4></v-card-text
    >

    <KeyValueTable :object="socket.handshake.query" />
  </v-card>
</template>
