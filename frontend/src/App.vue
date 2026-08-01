<script setup>
import { onMounted } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useAssetLoaderStore } from '@/stores/assetLoader'

const assetLoader = useAssetLoaderStore()

onMounted(() => {
  // kick off asset fetching only once the loading screen has painted
  assetLoader.load()
  // warm the Three.js chunk in the background so the plane is ready the instant content reveals
  import('@/components/FlyingPlane.vue')
})
</script>

<template>
  <LoadingScreen />
  <RouterView v-if="assetLoader.loaded" />
</template>

<style scoped></style>
