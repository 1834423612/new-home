<template>
  <div class="min-h-screen bg-kawaii-blue-100 text-kawaii-blue-900 font-cjkFonts_allseto flex flex-col justify-between">
    <header class="py-4 mb-6 px-4">
      <nav class="flex flex-col sm:flex-row justify-between items-center max-w-4xl mx-auto w-full gap-4">
        <img src="https://placehold.co/60x60/12a5ff/FFFFFF?text=Hello" alt="Kawaii Avatar" class="w-12 h-12 rounded-full border-4 border-kawaii-pink-300" />
        <div class="bg-white bg-opacity-70 backdrop-blur-md rounded-2xl px-4 py-2 border-solid border-2 border-blue-400 w-full sm:w-auto">
          <ul class="flex justify-center space-x-4 sm:space-x-6 overflow-x-auto whitespace-nowrap">
            <li v-for="route in routes" :key="route.path">
              <router-link :to="route.path" class="text-sm sm:text-lg font-medium hover:text-kawaii-pink-500 transition-colors duration-300" :class="{ 'text-kawaii-purple-500': route.path === currentRoute }">
                {{ route.name }}
              </router-link>
            </li>
          </ul>
        </div>
        <LanguageSelector />
      </nav>
    </header>

    <main class="max-w-4xl mx-auto px-4 w-full flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="mt-12 text-center text-kawaii-blue-600 pb-8 px-4">
      <p class="text-sm sm:text-base">{{ $t('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LanguageSelector from './components/LanguageSelector.vue'

const router = useRouter()
const route = useRoute()
const routes = ref(router.options.routes)
const currentRoute = computed(() => route.path)
</script>

<style>
@font-face {
  font-family: 'XiaolaiSC-Regular';
  src: url('src/assets/fonts/XiaolaiSC-Regular.woff2') format('woff2');
  /* cjkFonts_allseto_v1.11.woff2 */
}

.font-XiaolaiSC-Regular {
  font-family: 'XiaolaiSC-Regular', sans-serif;
  /* cjkFonts_allseto */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>