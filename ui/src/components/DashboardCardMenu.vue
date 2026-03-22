<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        icon="mdi-dots-vertical"
        size="x-small"
        variant="text"
        v-bind="props"
      />
    </template>
    <v-list density="compact" nav>
      <v-list-item title="Overview" />
    </v-list>
  </v-menu>
</template>