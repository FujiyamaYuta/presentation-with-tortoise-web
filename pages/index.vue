<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-4xl">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-2 flex items-center justify-center gap-2">🎯 プレゼンツール</h1>
      <p class="text-center text-slate-500 mb-6">PDF をアップロードして、時間をセットしたらスタート</p>

    <section class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end justify-items-center mb-6">
      <div class="flex flex-col">
        <label for="minutes" class="text-sm text-gray-600 mb-1">発表時間 (分)</label>
        <input id="minutes" type="number" min="1" step="1" v-model.number="presentationMinutes" class="w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-center" />
      </div>

      <div class="flex flex-col md:col-span-2">
        <label for="file" class="text-sm text-gray-600 mb-1">PDF スライド</label>
        <input id="file" type="file" accept="application/pdf" @change="onFileChange" class="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100" />
      </div>

      <div class="flex gap-2">
        <button @click="startPresentation" class="inline-flex items-center px-4 py-2 rounded-md shadow-sm bg-sky-600 text-white hover:bg-sky-700">開始</button>
        <button :disabled="!isTimerRunning" @click="resetTimer" class="inline-flex items-center px-4 py-2 rounded-md border border-slate-300 shadow-sm bg-white hover:bg-slate-50 disabled:opacity-50">リセット</button>
      </div>
    </section>

    <section v-show="isViewerReady || pdfUrl" ref="viewerRef" class="rounded-2xl border border-slate-200 bg-white/70 backdrop-blur shadow-lg overflow-hidden">
      <div class="flex items-center gap-3 p-3 border-b bg-white/60">
        <button @click="prevPage" :disabled="currentPage <= 1" class="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">◀ 前へ</button>
        <div class="flex items-center gap-1 text-sm text-slate-700">
          <input type="number" min="1" :max="numPages || 1" v-model.number="currentPageInput" @input="onPageInputChange" class="w-16 border border-slate-300 rounded px-1.5 py-1 text-center focus:outline-none focus:ring-2 focus:ring-sky-500" />
          <span>/ {{ numPages }}</span>
        </div>
        <button @click="nextPage" :disabled="currentPage >= numPages" class="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50">次へ ▶</button>
        <div class="flex-1" />
        <label class="flex items-center gap-2 text-sm text-slate-700">ズーム
          <input type="range" min="0.5" max="2.5" step="0.1" v-model.number="scale" @input="onZoomInput" class="w-40 accent-sky-600" />
        </label>
      </div>

      <div class="relative overflow-auto flex justify-center items-center bg-slate-50 p-4 min-h-[60vh]">
        <canvas v-show="isViewerReady" ref="canvasRef" class="block mx-auto shadow-lg"></canvas>
        <object v-if="!isViewerReady && pdfUrl" :data="pdfUrl" type="application/pdf" class="w-full h-[70vh]"></object>
        <div v-if="remainingSeconds >= 0" class="absolute right-3 bottom-3 bg-slate-900/70 text-white rounded-md px-2.5 py-1 text-xs font-mono ring-1 ring-white/10">
          ⏱ {{ remainingFormatted }}
        </div>
      </div>
    </section>
    </div>
  </div>
 </template>

<script setup>
import { ref, computed, onBeforeUnmount, nextTick } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc


const canvasRef = ref(null)
const viewerRef = ref(null)
const pdfUrl = ref('')
const pdfDoc = ref(null)
const currentPage = ref(1)
const currentPageInput = ref(1)
const numPages = ref(0)
const scale = ref(1.2)
const isViewerReady = computed(() => pdfDoc.value !== null && numPages.value > 0)

const presentationMinutes = ref(5)
const remainingSeconds = ref(-1)
let timerId = null
let pageAdvanceId = null
const isTimerRunning = computed(() => timerId !== null)

const remainingFormatted = computed(() => {
  if (remainingSeconds.value < 0) return '--:--'
  const m = Math.floor(remainingSeconds.value / 60)
  const s = remainingSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// Removed canStart; start button is always enabled by request

function onFileChange(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  // Accept PDFs by MIME type or by .pdf extension; some browsers don't set type
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '')
  if (!isPdf) {
    alert('PDF ファイルを選択してください')
    return
  }
  const reader = new FileReader()
  reader.onload = async (e) => {
    const arrayBuffer = e.target.result
    try {
      // Preview fallback via blob URL
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
      pdfUrl.value = URL.createObjectURL(blob)
    } catch {}
    await loadPdf(arrayBuffer)
  }
  reader.readAsArrayBuffer(file)
}

async function loadPdf(arrayBuffer) {
  try {
    resetTimer()
    currentPage.value = 1
    numPages.value = 0
    pdfDoc.value = null

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    pdfDoc.value = await loadingTask.promise
    numPages.value = pdfDoc.value.numPages
    console.log('[PDF] loaded, pages:', numPages.value)
    currentPageInput.value = 1
    
    // Delay rendering to ensure DOM is ready
    await nextTick()
    setTimeout(() => {
      if (canvasRef.value) {
        renderPage(1)
      }
    }, 100)
  } catch (err) {
    console.error('Failed to load PDF:', err)
    alert('PDF の読み込みに失敗しました。ファイルを確認してください。')
  }
}

async function renderPage(pageNumber) {
  if (!pdfDoc.value || !canvasRef.value) {
    console.warn('[PDF] render skipped: missing pdfDoc/canvas')
    return
  }
  
  try {
    // Get page without await first
    pdfDoc.value.getPage(pageNumber).then(async (page) => {
      const viewport = page.getViewport({ scale: scale.value })
      const canvas = canvasRef.value
      
      if (!canvas) return
      
      const context = canvas.getContext('2d')

      // Set canvas dimensions
      canvas.width = viewport.width
      canvas.height = viewport.height

      // Render directly to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      const renderTask = page.render(renderContext)
      await renderTask.promise
      
      console.log('[PDF] rendered page', pageNumber)
    }).catch(error => {
      console.error('[PDF] Failed to get page:', error)
    })
  } catch (error) {
    console.error('[PDF] Failed to render page:', error)
  }
}

async function nextPage() {
  if (currentPage.value >= numPages.value) return
  currentPage.value += 1
  await renderPage(currentPage.value)
  currentPageInput.value = currentPage.value
}

async function prevPage() {
  if (currentPage.value <= 1) return
  currentPage.value -= 1
  await renderPage(currentPage.value)
  currentPageInput.value = currentPage.value
}

async function rerender() {
  await renderPage(currentPage.value)
  currentPageInput.value = currentPage.value
}

let zoomDebounceId = null
function onZoomInput() {
  if (zoomDebounceId) clearTimeout(zoomDebounceId)
  zoomDebounceId = setTimeout(() => {
    rerender()
  }, 80)
}

async function onPageInputChange() {
  const target = Math.max(1, Math.min(numPages.value || 1, Math.floor(Number(currentPageInput.value) || 1)))
  if (target === currentPage.value) return
  currentPage.value = target
  await renderPage(currentPage.value)
}

async function startPresentation() {
  // if (!isViewerReady.value) return
  const rawMinutes = Number(presentationMinutes.value)
  const minutes = Number.isFinite(rawMinutes) ? Math.floor(rawMinutes) : 1
  const normalizedSeconds = Math.max(1, minutes) * 60
  presentationMinutes.value = Math.max(1, minutes)
  remainingSeconds.value = normalizedSeconds
  // Ensure first page is rendered in case it wasn't yet
  if (pdfDoc.value) {
    await nextTick()
    await renderPage(currentPage.value)
  }
  if (timerId) clearInterval(timerId)
  timerId = setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = 0
      clearInterval(timerId)
      timerId = null
      beep()
    }
  }, 1000)

  // Scroll viewer into view
  try { viewerRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch {}

  // Auto-advance pages evenly over remaining time
  if (pageAdvanceId) clearInterval(pageAdvanceId)
  if (numPages.value > 1) {
    const advanceOnce = async () => {
      await nextPage()
    }
    // Immediate first advance so進んだことが分かる
    advanceOnce()
    const computeIntervalMs = () => {
      const slidesLeft = Math.max(0, numPages.value - currentPage.value)
      const secondsLeft = Math.max(1, remainingSeconds.value)
      return slidesLeft > 0 ? Math.max(1000, Math.floor((secondsLeft * 1000) / slidesLeft)) : 0
    }
    let intervalMs = computeIntervalMs()
    if (intervalMs > 0) {
      pageAdvanceId = setInterval(async () => {
        await advanceOnce()
        const nextMs = computeIntervalMs()
        if (nextMs <= 0 || currentPage.value >= numPages.value) {
          clearInterval(pageAdvanceId)
          pageAdvanceId = null
        }
      }, intervalMs)
    }
  }
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
}

function beep() {
  // Simple beep using Web Audio API
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
    // ignore
  }
}

onBeforeUnmount(() => {
  resetTimer()
})
</script>

<style scoped>
</style>