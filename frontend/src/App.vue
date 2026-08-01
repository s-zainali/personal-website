<script setup>
import { onMounted, defineAsyncComponent } from 'vue'
import LoadingScreen from '@/components/LoadingScreen.vue'
import { useAssetLoaderStore } from '@/stores/assetLoader'

const FlyingPlane = defineAsyncComponent(() => import('@/components/FlyingPlane.vue'))

const assetLoader = useAssetLoaderStore()

onMounted(() => {
  assetLoader.load()
  import('@/components/FlyingPlane.vue') // warm the chunk during the loading screen
})
</script>

<template>
  <LoadingScreen />
  <template v-if="assetLoader.loaded">
    <FlyingPlane />
    <RouterView />
  </template>
</template>

<style scoped></style>