<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
    <div class="max-w-4xl w-full">
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">
          🎤 Presentation with Tortoise TTS
        </h1>
        <p class="text-xl text-gray-600">
          Create engaging presentations with AI-powered voice synthesis
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <NuxtLink to="/" class="group">
          <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div class="text-4xl mb-4">📄</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">PDF Viewer</h2>
            <p class="text-gray-600 mb-4">
              Upload and view PDF presentations with timer controls
            </p>
            <div class="flex items-center text-blue-600 group-hover:text-blue-700">
              <span class="mr-2">Open PDF Viewer</span>
              <Icon name="mdi:arrow-right" />
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/presentation" class="group">
          <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div class="text-4xl mb-4">🎯</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Presentation Mode</h2>
            <p class="text-gray-600 mb-4">
              View slides with Tortoise TTS audio narration
            </p>
            <div class="flex items-center text-blue-600 group-hover:text-blue-700">
              <span class="mr-2">Start Presenting</span>
              <Icon name="mdi:arrow-right" />
            </div>
          </div>
        </NuxtLink>

        <NuxtLink to="/edit" class="group">
          <div class="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div class="text-4xl mb-4">✏️</div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">Edit Slides</h2>
            <p class="text-gray-600 mb-4">
              Create and edit presentation content with speaker notes
            </p>
            <div class="flex items-center text-blue-600 group-hover:text-blue-700">
              <span class="mr-2">Edit Presentation</span>
              <Icon name="mdi:arrow-right" />
            </div>
          </div>
        </NuxtLink>

        <div class="group">
          <div class="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <div class="text-4xl mb-4">🤖</div>
            <h2 class="text-2xl font-bold mb-3">About Tortoise TTS</h2>
            <p class="text-white/90 mb-4">
              High-quality neural text-to-speech with natural voice synthesis
            </p>
            <div class="text-sm text-white/80">
              • Natural sounding voices<br>
              • Multiple voice options<br>
              • Emotional expression
            </div>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center text-gray-600">
        <p>Built with Nuxt 3 and Tortoise TTS API</p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>