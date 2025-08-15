<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
    <div class="container mx-auto px-4 py-8">
      <header class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">Presentation Mode</h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-slate-400">
            Slide {{ store.currentSlideIndex + 1 }} / {{ store.totalSlides }}
          </span>
          <NuxtLink to="/edit" class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition">
            Edit Mode
          </NuxtLink>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          <div class="bg-white text-slate-900 rounded-2xl shadow-2xl p-12 min-h-[500px] flex flex-col">
            <h2 class="text-4xl font-bold mb-6">{{ currentSlide.title }}</h2>
            <div class="flex-1 text-xl leading-relaxed whitespace-pre-line">
              {{ currentSlide.content }}
            </div>
          </div>

          <div class="flex items-center justify-between mt-8">
            <button
              @click="store.previousSlide"
              :disabled="!store.hasPrevious"
              class="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
            >
              <Icon name="mdi:chevron-left" class="text-xl" />
              Previous
            </button>

            <div class="flex gap-2">
              <button
                v-for="(slide, index) in store.slides"
                :key="slide.id"
                @click="store.goToSlide(index)"
                :class="[
                  'w-3 h-3 rounded-full transition',
                  index === store.currentSlideIndex 
                    ? 'bg-blue-500' 
                    : 'bg-slate-600 hover:bg-slate-500'
                ]"
              />
            </div>

            <button
              @click="store.nextSlide"
              :disabled="!store.hasNext"
              class="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
            >
              Next
              <Icon name="mdi:chevron-right" class="text-xl" />
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-slate-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">Speaker Notes</h3>
            <p class="text-slate-300 leading-relaxed">
              {{ currentSlide.notes }}
            </p>
          </div>

          <div class="bg-slate-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">Audio Controls</h3>
            
            <div class="space-y-4">
              <button
                @click="generateAudio"
                :disabled="currentSlide.isGenerating"
                class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Icon v-if="currentSlide.isGenerating" name="mdi:loading" class="animate-spin" />
                <Icon v-else name="mdi:microphone" />
                {{ currentSlide.isGenerating ? 'Generating...' : 'Generate Audio' }}
              </button>

              <div v-if="currentSlide.audioUrl" class="space-y-3">
                <button
                  @click="togglePlayback"
                  class="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition flex items-center justify-center gap-2"
                >
                  <Icon :name="store.isPlaying ? 'mdi:pause' : 'mdi:play'" />
                  {{ store.isPlaying ? 'Pause' : 'Play Audio' }}
                </button>

                <audio
                  ref="audioPlayer"
                  :src="currentSlide.audioUrl"
                  @ended="store.isPlaying = false"
                  class="w-full"
                  controls
                />
              </div>

              <div v-else-if="!currentSlide.isGenerating" class="text-center text-slate-500 py-4">
                No audio generated yet
              </div>
            </div>
          </div>

          <div class="bg-slate-800 rounded-xl p-6">
            <h3 class="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
            <ul class="space-y-2 text-sm text-slate-400">
              <li><kbd class="px-2 py-1 bg-slate-700 rounded">←</kbd> Previous slide</li>
              <li><kbd class="px-2 py-1 bg-slate-700 rounded">→</kbd> Next slide</li>
              <li><kbd class="px-2 py-1 bg-slate-700 rounded">Space</kbd> Play/Pause audio</li>
              <li><kbd class="px-2 py-1 bg-slate-700 rounded">G</kbd> Generate audio</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePresentationStore } from '~/stores/presentation'

const store = usePresentationStore()
const audioPlayer = ref(null)
const currentSlide = computed(() => store.currentSlide)

async function generateAudio() {
  await store.generateAudio(currentSlide.value.id)
}

function togglePlayback() {
  if (store.isPlaying) {
    store.stopAudio()
  } else if (currentSlide.value.audioUrl) {
    store.playAudio(currentSlide.value.audioUrl)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
  store.stopAudio()
})

function handleKeyPress(e) {
  switch(e.key) {
    case 'ArrowLeft':
      store.previousSlide()
      break
    case 'ArrowRight':
      store.nextSlide()
      break
    case ' ':
      e.preventDefault()
      togglePlayback()
      break
    case 'g':
    case 'G':
      generateAudio()
      break
  }
}
</script>