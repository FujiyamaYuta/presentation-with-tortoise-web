<template>
  <div 
    class="transition-colors duration-500"
    :class="[
      isPresentationMode 
        ? 'bg-gradient-to-b from-slate-900 to-slate-800 fixed inset-0 z-50' 
        : 'bg-gradient-to-b from-slate-50 to-white min-h-screen flex items-center justify-center px-4 py-8'
    ]"
  >
    <div 
      class="w-full transition-all duration-500"
      :class="isPresentationMode ? '' : 'max-w-6xl'"
    >
      <h1 
        v-show="!isPresentationMode"
        class="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-6 flex items-center justify-center gap-2"
      >
        🎯 プレゼンツール
      </h1>

      <section 
        v-show="!isPresentationMode"
        class="rounded-xl shadow-sm border p-6 mb-6 transition-all duration-500"
        :class="'bg-white border-slate-200'"
      >
        <div class="flex flex-wrap items-center gap-4">
          <!-- 発表時間設定 -->
          <div class="flex items-center gap-2">
            <label 
              for="minutes" 
              class="text-sm font-medium whitespace-nowrap transition-colors duration-300"
              :class="isPresentationMode ? 'text-slate-200' : 'text-gray-700'"
            >
              ⏱ 発表時間
            </label>
            <div class="flex items-center">
              <input 
                id="minutes" 
                type="number" 
                min="1" 
                step="1" 
                v-model.number="presentationMinutes" 
                class="w-20 border border-gray-300 rounded-l-md px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" 
              />
              <span 
                class="border border-l-0 rounded-r-md px-3 py-2 text-sm transition-colors duration-300"
                :class="isPresentationMode ? 'bg-slate-700 border-slate-500 text-slate-300' : 'bg-gray-50 border-gray-300 text-gray-600'"
              >
                分
              </span>
            </div>
          </div>

          <!-- PDFアップロード -->
          <div class="flex-1 min-w-[200px]">
            <div class="relative">
              <input 
                id="file" 
                ref="fileInput"
                type="file" 
                accept="application/pdf" 
                @change="onFileChange" 
                class="sr-only" 
              />
              <div 
                @click="openFileDialog"
                class="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                :class="[
                  isPresentationMode 
                    ? (pdfFile ? 'border-green-400 bg-green-900/30' : 'border-slate-500 hover:border-sky-400 hover:bg-slate-700/50')
                    : (pdfFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50')
                ]"
              >
                <div class="text-center">
                  <div 
                    v-if="!pdfFile" 
                    class="flex items-center gap-2 transition-colors duration-300"
                    :class="isPresentationMode ? 'text-slate-300' : 'text-gray-600'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-sm font-medium">PDFファイルを選択</span>
                  </div>
                  <div 
                    v-else 
                    class="flex items-center gap-2 transition-colors duration-300"
                    :class="isPresentationMode ? 'text-green-300' : 'text-green-700'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="text-sm font-medium truncate">{{ pdfFile.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-3 flex-shrink-0">
            <button 
              @click="startPresentation" 
              :disabled="pdfPages.length === 0"
              class="px-16 py-3 min-w-[180px] min-h-[48px] rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-sm whitespace-nowrap text-base"
            >
              ▶ 開始
            </button>
            <button 
              :disabled="!isTimerRunning" 
              @click="resetTimer" 
              class="px-6 py-3 min-h-[48px] rounded-lg border border-slate-300 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap text-base"
            >
              ↺ リセット
            </button>
          </div>
        </div>
      </section>

      <section 
        v-if="pdfPages.length > 0" 
        class="overflow-hidden backdrop-blur transition-all duration-500"
        :class="[
          isPresentationMode 
            ? 'fixed inset-0 bg-transparent' 
            : 'rounded-2xl border border-slate-200 bg-white/70 shadow-lg'
        ]"
      >
        <div 
          v-show="!isPresentationMode"
          class="flex items-center gap-3 p-3 border-b transition-all duration-300"
          :class="'border-b bg-white/60'"
        >
          <button 
            @click="prevPage" 
            :disabled="currentPage <= 1" 
            class="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            ◀ 前へ
          </button>
          
          <div class="flex items-center gap-1 text-sm text-slate-700">
            <input 
              type="number" 
              min="1" 
              :max="totalPages" 
              v-model.number="currentPageInput" 
              @change="goToPage"
              class="w-16 border border-slate-300 rounded px-1.5 py-1 text-center focus:outline-none focus:ring-2 focus:ring-sky-500" 
            />
            <span>/ {{ totalPages }}</span>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage >= totalPages" 
            class="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            次へ ▶
          </button>
          
          <div class="flex-1" />
          
          <label class="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              v-model="autoFit"
              class="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <span>自動調整</span>
          </label>
          
          <label v-if="!autoFit" class="flex items-center gap-2 text-sm text-slate-700">
            ズーム
            <input 
              type="range" 
              min="0.5" 
              max="2.5" 
              step="0.1" 
              v-model.number="scale" 
              class="w-40 accent-sky-600" 
            />
            <span class="text-xs">{{ Math.round(scale * 100) }}%</span>
          </label>
          
          <button
            @click="toggleFullscreen"
            class="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
          >
            {{ isFullscreen ? '通常表示' : '全画面' }}
          </button>
        </div>

        <div 
          class="relative transition-all duration-500" 
          :class="isPresentationMode ? 'bg-slate-900' : 'bg-slate-50'"
          ref="pdfContainer" 
          :style="{ 
            height: isPresentationMode ? '100vh' : containerHeight, 
            width: isPresentationMode ? '100vw' : 'auto',
            overflow: autoFit ? 'hidden' : 'auto' 
          }"
        >
          <div 
            class="flex justify-center items-center" 
            :style="{ 
              height: isPresentationMode ? '100vh' : containerHeight, 
              width: isPresentationMode ? '100vw' : 'auto',
              padding: '0' 
            }"
          >
            <!-- All pages pre-rendered and positioned absolutely -->
            <div :style="slideContainerStyle">
              <img
                v-for="(page, index) in pdfPages"
                :key="`page-${index}`"
                v-show="currentPage === index + 1"
                :src="page.imageUrl"
                :alt="`Page ${index + 1}`"
                class="absolute top-0 left-0 w-full h-full shadow-lg bg-white"
                style="object-fit: contain"
              />
            </div>
          </div>
          
          <div 
            v-if="remainingSeconds >= 0" 
            class="absolute right-3 bottom-3 bg-slate-900/70 text-white rounded-md px-2.5 py-1 text-xs font-mono ring-1 ring-white/10 z-10"
          >
            ⏱ {{ remainingFormatted }}
          </div>
          
          <!-- プレゼンテーションモード時のページネーション（左上） -->
          <div 
            v-if="isPresentationMode"
            class="absolute top-4 left-4 z-20"
          >
            <!-- ページネーション -->
            <div class="flex items-center gap-2 bg-slate-800/80 text-white rounded-lg px-4 py-2 backdrop-blur">
              <button
                @click="prevPage"
                :disabled="currentPage <= 1"
                class="p-1 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              
              <div class="flex items-center gap-1 text-sm">
                <input 
                  type="number" 
                  min="1" 
                  :max="totalPages" 
                  v-model.number="currentPageInput" 
                  @change="goToPage"
                  @keyup.enter="goToPage"
                  class="w-12 bg-slate-700 text-white text-center rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" 
                />
                <span class="text-xs text-slate-300">/ {{ totalPages }}</span>
              </div>
              
              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="p-1 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- プレゼンテーションモード時の終了ボタン（右上） -->
          <div 
            v-if="isPresentationMode"
            class="absolute top-4 right-4 z-20"
          >
            <button
              @click="resetTimer"
              class="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors text-sm backdrop-blur"
            >
              終了
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="!pdfFile" class="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <p class="text-slate-500">PDFファイルをアップロードしてください</p>
      </section>
      
      <section v-else-if="isLoading" class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent"></div>
          <p class="text-slate-500">PDFを処理中... ({{ loadingProgress }}/{{ totalPages }} ページ)</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'

const pdfFile = ref(null)
const pdfPages = ref([])
const currentPage = ref(1)
const currentPageInput = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const autoFit = ref(true)
const presentationMinutes = ref(5)
const remainingSeconds = ref(-1)
const isFullscreen = ref(false)
const isLoading = ref(false)
const loadingProgress = ref(0)
const pdfContainer = ref(null)
const fileInput = ref(null)
const containerHeight = ref('70vh')
const windowSize = ref({ width: 0, height: 0 })
const isNavigating = ref(false)

let timerId = null
let pageAdvanceId = null

const isTimerRunning = computed(() => timerId !== null)
const isPresentationMode = computed(() => remainingSeconds.value >= 0 && pdfPages.value.length > 0)

const remainingFormatted = computed(() => {
  if (remainingSeconds.value < 0) return '--:--'
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const slideContainerStyle = computed(() => {
  // Trigger recompute on window resize
  const triggerResize = windowSize.value.width + windowSize.value.height
  
  const currentPageData = pdfPages.value[currentPage.value - 1]
  if (!currentPageData) return {}
  
  let finalScale = scale.value
  
  if (autoFit.value && pdfContainer.value) {
    // Calculate scale to fit within container
    const containerRect = pdfContainer.value?.getBoundingClientRect()
    if (containerRect) {
      const containerWidth = containerRect.width
      const containerHeightNum = containerRect.height
      
      // No padding - use full container
      const availableWidth = containerWidth
      const availableHeight = containerHeightNum
      
      const scaleX = availableWidth / currentPageData.width
      const scaleY = availableHeight / currentPageData.height
      finalScale = Math.min(scaleX, scaleY)
    }
  }
  
  // Calculate scaled dimensions
  const scaledWidth = currentPageData.width * finalScale
  const scaledHeight = currentPageData.height * finalScale
  
  return {
    position: 'relative',
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    transition: 'all 0.2s ease'
  }
})

function openFileDialog() {
  fileInput.value?.click()
}

async function onFileChange(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
  if (!isPdf) {
    alert('PDF ファイルを選択してください')
    return
  }
  
  pdfFile.value = file
  isLoading.value = true
  loadingProgress.value = 0
  
  try {
    // Load PDF.js dynamically
    const pdfjsLib = await import('pdfjs-dist')
    const workerSrc = await import('pdfjs-dist/build/pdf.worker.min.js?url')
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc.default
    
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdfDoc = await loadingTask.promise
    
    totalPages.value = pdfDoc.numPages
    pdfPages.value = []
    
    // Pre-render all pages to images
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i)
      const viewport = page.getViewport({ scale: 2.0 }) // Higher quality
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise
      
      // Convert to image data URL
      const imageUrl = canvas.toDataURL('image/png', 0.95)
      pdfPages.value.push({
        pageNumber: i,
        imageUrl,
        width: viewport.width,
        height: viewport.height
      })
      
      loadingProgress.value = i
    }
    
    currentPage.value = 1
    currentPageInput.value = 1
    resetTimer()
  } catch (error) {
    console.error('Failed to load PDF:', error)
    alert('PDF の読み込みに失敗しました')
  } finally {
    isLoading.value = false
    loadingProgress.value = 0
  }
}

function nextPage() {
  if (currentPage.value >= totalPages.value || isNavigating.value) return
  isNavigating.value = true
  currentPage.value += 1
  currentPageInput.value = currentPage.value
  // デバウンス処理
  setTimeout(() => {
    isNavigating.value = false
  }, 150)
}

function prevPage() {
  if (currentPage.value <= 1 || isNavigating.value) return
  isNavigating.value = true
  currentPage.value -= 1
  currentPageInput.value = currentPage.value
  // デバウンス処理
  setTimeout(() => {
    isNavigating.value = false
  }, 150)
}

function goToPage() {
  if (isNavigating.value) return
  isNavigating.value = true
  currentPage.value = Math.max(1, Math.min(totalPages.value, currentPageInput.value))
  currentPageInput.value = currentPage.value
  setTimeout(() => {
    isNavigating.value = false
  }, 150)
}

function startPresentation() {
  if (pdfPages.value.length === 0) return
  
  const minutes = Math.max(1, Math.floor(presentationMinutes.value || 1))
  presentationMinutes.value = minutes
  remainingSeconds.value = minutes * 60
  
  if (timerId) clearInterval(timerId)
  timerId = setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = 0
      clearInterval(timerId)
      timerId = null
      beep()
      // 時間切れでもプレゼンテーションモードは継続
      // remainingSeconds は 0 のまま維持してプレゼンモードを継続
    }
  }, 1000)
  
  // 自動進行機能を無効化
  // ユーザーが手動でページを操作するためタイマーのみ動作
  if (pageAdvanceId) clearInterval(pageAdvanceId)
  
  // スクロールを上部に移動
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  if (pageAdvanceId) {
    clearInterval(pageAdvanceId)
    pageAdvanceId = null
  }
  remainingSeconds.value = -1
  // プレゼンテーションモード終了時にページ上部にスクロール
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    o.connect(g)
    g.connect(ctx.destination)
    g.gain.setValueAtTime(0.001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01)
    o.start()
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2)
      o.stop(ctx.currentTime + 0.25)
      ctx.close()
    }, 200)
  } catch (e) {
    console.error('Failed to play beep:', e)
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    if (document.documentElement?.requestFullscreen) {
      document.documentElement.requestFullscreen()
      isFullscreen.value = true
      containerHeight.value = '100vh'
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
      containerHeight.value = '70vh'
    }
  }
}

onMounted(() => {
  // Initialize window size
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  // Handle window resize with debounce
  let resizeTimeout = null
  const handleResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      windowSize.value = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }, 100)
  }
  
  window.addEventListener('resize', handleResize)
  
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
    containerHeight.value = isFullscreen.value ? '100vh' : '70vh'
    // Trigger resize calculation
    setTimeout(() => {
      windowSize.value = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }, 50)
  })
  
  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (pdfPages.value.length === 0) return
    
    switch(e.key) {
      case 'Escape':
        if (isPresentationMode.value) {
          e.preventDefault()
          resetTimer()
        }
        break
      case 'ArrowLeft':
        e.preventDefault()
        prevPage()
        break
      case 'ArrowRight':
        e.preventDefault()
        nextPage()
        break
      case 'f':
      case 'F':
        if (!isPresentationMode.value) {
          toggleFullscreen()
        }
        break
      case ' ':
        e.preventDefault()
        if (!isTimerRunning.value && !isPresentationMode.value) {
          startPresentation()
        }
        break
      case '+':
      case '=':
        if (!isPresentationMode.value) {
          autoFit.value = false
          scale.value = Math.min(2.5, scale.value + 0.1)
        }
        break
      case '-':
      case '_':
        if (!isPresentationMode.value) {
          autoFit.value = false
          scale.value = Math.max(0.5, scale.value - 0.1)
        }
        break
      case '0':
        if (!isPresentationMode.value) {
          autoFit.value = !autoFit.value
        }
        break
    }
  })
})

onBeforeUnmount(() => {
  resetTimer()
})
</script>

<style scoped>
</style>