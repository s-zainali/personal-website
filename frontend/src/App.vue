<script setup>
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useAssetLoaderStore } from '@/stores/assetLoader'

const assetLoader = useAssetLoaderStore()
assetLoader.load()
</script>

<template>
  <LoadingScreen />
  <RouterView v-if="assetLoader.loaded" />
</template>

<style scoped></style>
