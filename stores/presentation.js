import { defineStore } from 'pinia'

export const usePresentationStore = defineStore('presentation', {
  state: () => ({
    slides: [
      {
        id: 1,
        title: 'Welcome to AI Presentation',
        content: 'This presentation demonstrates Tortoise TTS integration with Nuxt.',
        notes: 'Welcome everyone. Today we will explore how artificial intelligence can enhance presentations through text-to-speech technology.',
        audioUrl: null,
        isGenerating: false
      },
      {
        id: 2,
        title: 'What is Tortoise TTS?',
        content: 'Tortoise is a text-to-speech system that produces high-quality, natural-sounding voices.',
        notes: 'Tortoise TTS is an advanced neural network model that can generate remarkably human-like speech from text input.',
        audioUrl: null,
        isGenerating: false
      },
      {
        id: 3,
        title: 'Key Features',
        content: '• Natural voice synthesis\n• Multiple voice options\n• Emotional expression\n• Language support',
        notes: 'The key features include natural voice synthesis with multiple voice options, the ability to express emotions, and support for various languages.',
        audioUrl: null,
        isGenerating: false
      },
      {
        id: 4,
        title: 'Applications',
        content: '• Audiobooks\n• Virtual assistants\n• Accessibility tools\n• Content creation',
        notes: 'Tortoise TTS has many applications including audiobook narration, virtual assistants, accessibility tools for visually impaired users, and content creation.',
        audioUrl: null,
        isGenerating: false
      },
      {
        id: 5,
        title: 'Thank You',
        content: 'Questions?',
        notes: 'Thank you for your attention. I would be happy to answer any questions you may have.',
        audioUrl: null,
        isGenerating: false
      }
    ],
    currentSlideIndex: 0,
    isPlaying: false,
    currentAudio: null
  }),

  getters: {
    currentSlide: (state) => state.slides[state.currentSlideIndex],
    totalSlides: (state) => state.slides.length,
    hasNext: (state) => state.currentSlideIndex < state.slides.length - 1,
    hasPrevious: (state) => state.currentSlideIndex > 0
  },

  actions: {
    nextSlide() {
      if (this.hasNext) {
        this.currentSlideIndex++
        this.stopAudio()
      }
    },

    previousSlide() {
      if (this.hasPrevious) {
        this.currentSlideIndex--
        this.stopAudio()
      }
    },

    goToSlide(index) {
      if (index >= 0 && index < this.slides.length) {
        this.currentSlideIndex = index
        this.stopAudio()
      }
    },

    async generateAudio(slideId) {
      const slide = this.slides.find(s => s.id === slideId)
      if (!slide || slide.isGenerating) return

      slide.isGenerating = true
      
      try {
        const response = await $fetch('/api/tts', {
          method: 'POST',
          body: {
            text: slide.notes,
            voice: 'default'
          }
        })
        
        slide.audioUrl = response.audioUrl
      } catch (error) {
        console.error('Failed to generate audio:', error)
      } finally {
        slide.isGenerating = false
      }
    },

    playAudio(audioUrl) {
      if (this.currentAudio) {
        this.currentAudio.pause()
      }

      this.currentAudio = new Audio(audioUrl)
      this.currentAudio.play()
      this.isPlaying = true

      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false
      })
    },

    stopAudio() {
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio = null
        this.isPlaying = false
      }
    },

    updateSlide(slideId, updates) {
      const slide = this.slides.find(s => s.id === slideId)
      if (slide) {
        Object.assign(slide, updates)
      }
    },

    addSlide() {
      const newId = Math.max(...this.slides.map(s => s.id)) + 1
      this.slides.push({
        id: newId,
        title: 'New Slide',
        content: 'Slide content here',
        notes: 'Speaker notes here',
        audioUrl: null,
        isGenerating: false
      })
    },

    deleteSlide(slideId) {
      const index = this.slides.findIndex(s => s.id === slideId)
      if (index !== -1 && this.slides.length > 1) {
        this.slides.splice(index, 1)
        if (this.currentSlideIndex >= this.slides.length) {
          this.currentSlideIndex = this.slides.length - 1
        }
      }
    }
  }
})