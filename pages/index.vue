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
      <!-- Header with logo -->
      <div 
        v-show="!isPresentationMode"
        class="mb-6"
      >
        <h1 class="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-2">
          🐢 Tortoise
        </h1>
        <p class="text-sm text-slate-600 mt-1">Slow and steady wins the race</p>
      </div>

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
          <div v-if="!isPresenting && !isPresentationMode" class="flex-1 min-w-[200px]">
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
                @drop.prevent="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                class="flex items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
                :class="[
                  pdfFile 
                    ? 'border-green-300 bg-green-50 hover:border-sky-400 hover:bg-sky-50' 
                    : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50'
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
              :disabled="!pdfFile" 
              @click="resetTimer" 
              class="px-6 py-3 min-h-[48px] rounded-lg border border-slate-300 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap text-base"
            >
              ↺ リセット
            </button>
          </div>
        </div>
      </section>

      <!-- サービス説明 -->
      <div 
        v-show="!isPresentationMode"
        class="mb-8 px-2"
      >
        <button
          @click="showAbout = !showAbout"
          class="text-sm text-slate-500 hover:text-slate-700 underline cursor-pointer mb-2"
        >
          このツールはなに？
        </button>
        <p v-if="showAbout" class="text-sm text-slate-500 leading-relaxed mt-2">
          このサービスはプレゼンを時間通りに進めるためのツールです。うさぎ（🐰 スライドの進捗）とカメ（🐢 時間）でそれぞれが進み、現時点のスライドの進捗を可視化することができます。<a href="https://rabbit-shocker.org/ja/" target="_blank" class="text-slate-600 hover:text-slate-800 underline">Rabbit</a>というツールをオマージュしており、Nuxt3で作っています。
        </p>
      </div>

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
          
          <!-- プレゼンテーションモード時の統一コントロールバー（上部） -->
          <div 
            v-if="isPresentationMode"
            class="absolute top-4 left-4 z-20"
          >
            <!-- 左側：ページネーション＆オプション -->
            <div class="flex flex-col gap-1">
              <!-- 上段：ページネーション -->
              <div class="flex items-center gap-1 bg-slate-800/80 text-white rounded-md px-2 py-1 backdrop-blur text-xs">
                <button
                  @click="prevPage"
                  :disabled="currentPage <= 1"
                  class="p-0.5 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                
                <div class="flex items-center gap-0.5">
                  <input 
                    type="number" 
                    min="1" 
                    :max="totalPages" 
                    v-model.number="currentPageInput" 
                    @change="goToPage"
                    @keyup.enter="goToPage"
                    class="w-8 bg-slate-700 text-white text-center rounded px-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" 
                  />
                  <span class="text-xs text-slate-300">/ {{ totalPages }}</span>
                </div>
                
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="p-0.5 rounded hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              
              <!-- 下段：オプションボタンとタイマー -->
              <div class="flex items-center gap-1 bg-slate-800/80 text-white rounded-md px-2 py-1 backdrop-blur">
                <!-- レースバー表示切り替え -->
                <button
                  @click="showRaceBar = !showRaceBar"
                  class="p-0.5 rounded hover:bg-slate-600/80 transition-colors"
                  :title="showRaceBar ? 'レースを非表示' : 'レースを表示'"
                >
                  <svg v-if="showRaceBar" class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                </button>
                
                <!-- タイマー表示切り替え -->
                <button
                  @click="showTimer = !showTimer"
                  class="p-0.5 rounded hover:bg-slate-600/80 transition-colors"
                  :title="showTimer ? 'タイマーを非表示' : 'タイマーを表示'"
                >
                  <svg v-if="showTimer" class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                  </svg>
                </button>
                
                <!-- セパレーター -->
                <div class="w-px h-2.5 bg-slate-600 mx-0.5"></div>
                
                <!-- 終了ボタン（アイコン） -->
                <button
                  @click="stopPresentation"
                  class="p-0.5 rounded hover:bg-red-600/80 transition-colors"
                  title="プレゼンテーションを終了"
                >
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <!-- セパレーター -->
                <div v-if="showTimer && remainingSeconds >= 0" class="w-px h-2.5 bg-slate-600 mx-0.5"></div>
                
                <!-- タイマー -->
                <div 
                  v-if="showTimer && remainingSeconds >= 0" 
                  class="text-xs font-mono"
                >
                  {{ remainingFormatted }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- うさぎとカメのレース（プレゼンモード時のみ） -->
          <div 
            v-if="isPresentationMode && showRaceBar"
            class="absolute bottom-0 left-0 w-full h-6 z-10 pointer-events-none"
          >
            <!-- レーストラック -->
            <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-yellow-400">
              <!-- ゴールライン -->
              <div class="absolute right-0 top-0 w-0.5 h-full bg-red-600"></div>
              <!-- スタートライン -->
              <div class="absolute left-0 top-0 w-0.5 h-full bg-blue-600"></div>
            </div>
            
            <!-- うさぎ -->
            <div 
              class="absolute bottom-0 transition-all duration-1000 ease-in-out transform"
              :style="{ left: `calc(4px + ${rabbitPositionPercent}% * 0.96)` }"
            >
              <div class="relative">
                <div 
                  class="text-2xl transition-transform duration-300"
                  :class="winner === 'rabbit' ? 'animate-bounce' : ''"
                >
                  🐰
                </div>
                <!-- 勝利エフェクト（最後のスライドでのみ表示） -->
                <div v-if="winner === 'rabbit' && currentPage === totalPages" class="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div class="text-yellow-400 text-lg animate-pulse">🎉</div>
                </div>
              </div>
            </div>
            
            <!-- カメ（右向きに修正） -->
            <div 
              class="absolute bottom-0 transition-all duration-500 ease-in-out transform"
              :style="{ left: `calc(4px + ${turtlePositionPercent}% * 0.96)` }"
            >
              <div class="relative">
                <div 
                  class="text-2xl transition-transform duration-300 transform scale-x-[-1]"
                  :class="winner === 'turtle' ? 'animate-bounce' : ''"
                >
                  🐢
                </div>
                <!-- 勝利エフェクト（最後のスライドでのみ表示） -->
                <div v-if="winner === 'turtle' && currentPage === totalPages" class="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div class="text-yellow-400 text-lg animate-pulse">🎉</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section v-else-if="isLoading" class="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-sky-600 border-t-transparent"></div>
          <p class="text-slate-500">PDFを処理中... ({{ loadingProgress }}/{{ totalPages }} ページ)</p>
        </div>
      </section>
    </div>
    
    <!-- Copyright -->
    <div 
      v-if="!isPresentationMode"
      class="fixed bottom-2 right-2 text-xs text-slate-500"
    >
      <a 
        href="https://github.com/FujiyamaYuta/presentation-with-tortoise-web" 
        target="_blank"
        class="hover:text-slate-700 transition-colors"
      >
        © OH MY GOD Inc.
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'

const pdfFile = ref(null)
const pdfPages = ref([])
const currentPage = ref(1)
const currentPageInput = ref(1)
const totalPages = ref(0)
const scale = ref(1.0)
const autoFit = ref(true)
const presentationMinutes = ref(5)
const remainingSeconds = ref(-1)
const isLoading = ref(false)
const loadingProgress = ref(0)
const pdfContainer = ref(null)
const fileInput = ref(null)
const containerHeight = ref('70vh')
const windowSize = ref({ width: 0, height: 0 })
const isNavigating = ref(false)
// うさぎとカメのレース用
const rabbitPosition = ref(0) // パーセンテージ (0-100)
const turtlePosition = ref(0) // パーセンテージ (0-100)
const raceWinner = ref(null) // 'rabbit' | 'turtle' | null
const totalPresentationTime = ref(0) // 総プレゼン時間（秒）
const showRaceBar = ref(true) // レースバーの表示/非表示
const isPresenting = ref(false) // プレゼンテーション中フラグ（より確実な状態管理）
const showAbout = ref(false) // About説明の表示/非表示
const showTimer = ref(true) // タイマーの表示/非表示

let timerId = null
let pageAdvanceId = null

const isTimerRunning = computed(() => timerId !== null)
const isPresentationMode = computed(() => remainingSeconds.value >= 0 && pdfPages.value.length > 0)

// うさぎの位置計算（スライドベース）
const rabbitPositionPercent = computed(() => {
  if (!isPresentationMode.value || totalPages.value === 0) return 0
  if (totalPages.value === 1) return 100 // 1ページのみの場合は100%
  return Math.min(100, ((currentPage.value - 1) / (totalPages.value - 1)) * 100)
})

// カメの位置計算（時間ベース）
const turtlePositionPercent = computed(() => {
  if (!isPresentationMode.value || totalPresentationTime.value === 0) return 0
  const elapsedTime = totalPresentationTime.value - remainingSeconds.value
  return Math.min(100, (elapsedTime / totalPresentationTime.value) * 100)
})

// 勝者判定（副作用を回避）
const winner = computed(() => {
  if (!isPresentationMode.value) return raceWinner.value
  
  const rabbitAtFinish = rabbitPositionPercent.value >= 100
  const turtleAtFinish = turtlePositionPercent.value >= 100
  
  // 既に勝者が決まっている場合はそのまま返す
  if (raceWinner.value) {
    return raceWinner.value
  }
  
  // まだ勝者が決まっていない場合のみ判定
  if (rabbitAtFinish) {
    return 'rabbit'
  } else if (turtleAtFinish) {
    return 'turtle'
  }
  
  return null
})

// 勝者の記録（watchで副作用を分離）
watch(winner, (newWinner) => {
  if (newWinner && !raceWinner.value) {
    raceWinner.value = newWinner
  }
})

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
  if (isPresenting.value || isPresentationMode.value) {
    console.log('[DEBUG] openFileDialog blocked - presentation active')
    return
  }
  fileInput.value?.click()
}

function handleDrop(event) {
  if (isPresenting.value || isPresentationMode.value) {
    console.log('[DEBUG] handleDrop blocked - presentation active')
    return
  }
  const files = event.dataTransfer.files
  if (files.length > 0) {
    // ファイル入力にドロップされたファイルを設定
    fileInput.value.files = files
    // onFileChangeを手動でトリガー
    onFileChange({ target: { files } })
  }
}

async function onFileChange(event) {
  // 最優先でプレゼンテーションモードチェック（グローバルフラグを最初にチェック）
  console.log('[DEBUG] onFileChange - isPresenting:', isPresenting.value, 'remainingSeconds:', remainingSeconds.value, 'pdfPages.length:', pdfPages.value.length, 'isPresentationMode:', isPresentationMode.value)
  
  // 最優先: グローバルフラグでチェック
  if (isPresenting.value) {
    console.log('[DEBUG] onFileChange BLOCKED - isPresenting flag is true')
    event.preventDefault()
    event.stopPropagation()
    return false
  }
  
  // 二重チェック: remainingSecondsが0以上の場合はプレゼンテーション中
  if (remainingSeconds.value >= 0 || isPresentationMode.value) {
    console.log('[DEBUG] onFileChange BLOCKED - presentation active (remainingSeconds >= 0 or isPresentationMode)')
    event.preventDefault()
    event.stopPropagation()
    return false
  }

  console.log('[DEBUG] onFileChange processing normally')
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
      const context = canvas.getContext('2d', { willReadFrequently: true })
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
    
    // プレゼンテーション中でない場合のみページを1にリセット
    if (!isPresenting.value && !isPresentationMode.value) {
      console.log(`[DEBUG] Page reset to 1 (onFileChange - not presenting)`)
      currentPage.value = 1
      currentPageInput.value = 1
    } else {
      console.log(`[DEBUG] Page preserved during presentation (onFileChange)`)
    }
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
  const oldPage = currentPage.value
  currentPage.value += 1
  currentPageInput.value = currentPage.value
  console.log(`[DEBUG] Page changed from ${oldPage} to ${currentPage.value} (nextPage)`)
  // デバウンス処理
  setTimeout(() => {
    isNavigating.value = false
  }, 150)
}

function prevPage() {
  if (currentPage.value <= 1 || isNavigating.value) return
  isNavigating.value = true
  const oldPage = currentPage.value
  currentPage.value -= 1
  currentPageInput.value = currentPage.value
  console.log(`[DEBUG] Page changed from ${oldPage} to ${currentPage.value} (prevPage)`)
  // デバウンス処理
  setTimeout(() => {
    isNavigating.value = false
  }, 150)
}

function goToPage() {
  if (isNavigating.value) return
  isNavigating.value = true
  const oldPage = currentPage.value
  currentPage.value = Math.max(1, Math.min(totalPages.value, currentPageInput.value))
  currentPageInput.value = currentPage.value
  console.log(`[DEBUG] Page changed from ${oldPage} to ${currentPage.value} (goToPage)`)
  setTimeout(() => {
    isNavigating.value = false
  }, 150)
}

function startPresentation() {
  if (pdfPages.value.length === 0) return
  
  // 最初にプレゼンテーションフラグを設定
  isPresenting.value = true
  console.log('[DEBUG] Presentation started - isPresenting set to true')
  
  const minutes = Math.max(1, Math.floor(presentationMinutes.value || 1))
  presentationMinutes.value = minutes
  remainingSeconds.value = minutes * 60
  totalPresentationTime.value = minutes * 60
  
  // レースの初期化
  rabbitPosition.value = 0
  turtlePosition.value = 0
  raceWinner.value = null
  
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

// プレゼンテーションのみ終了（ページはそのまま）
function stopPresentation() {
  // 最初にプレゼンテーションフラグをクリア
  isPresenting.value = false
  console.log('[DEBUG] Presentation stopped - isPresenting set to false')
  
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
  if (pageAdvanceId) {
    clearInterval(pageAdvanceId)
    pageAdvanceId = null
  }
  remainingSeconds.value = -1
  
  // レースデータのリセット
  rabbitPosition.value = 0
  turtlePosition.value = 0
  raceWinner.value = null
  totalPresentationTime.value = 0
  
  // プレゼンテーションモード終了時にページ上部にスクロール
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// 完全リセット（PDFファイルもリセット）
function resetTimer() {
  stopPresentation()
  
  // PDFデータのリセット
  pdfFile.value = null
  pdfPages.value = []
  console.log(`[DEBUG] Page reset to 1 (resetTimer)`)
  currentPage.value = 1
  currentPageInput.value = 1
  totalPages.value = 0
  
  // ファイル入力をクリア
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  
  // ローディング状態もリセット
  isLoading.value = false
  loadingProgress.value = 0
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
  
  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (pdfPages.value.length === 0) return
    
    switch(e.key) {
      case 'Escape':
        if (isPresentationMode.value) {
          e.preventDefault()
          stopPresentation()
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
      case 'r':
      case 'R':
        if (isPresentationMode.value) {
          showRaceBar.value = !showRaceBar.value
        }
        break
    }
  })
})

onBeforeUnmount(() => {
  stopPresentation()
})
</script>

<style scoped>
</style>