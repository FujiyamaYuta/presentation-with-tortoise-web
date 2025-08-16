// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/fonts', '@nuxt/icon', '@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/tailwind.css'],
  app: {
    head: {
      title: 'Tortoise',
      meta: [
        { 
          name: 'description', 
          content: 'このサービスはプレゼンを時間通りに進めるためのツールです。うさぎ（🐰 スライドの進捗）とカメ（🐢 時間）でそれぞれが進み、現時点のスライドの進捗を可視化することができます。Rabbitというツールをオマージュしており、Nuxt3で作っています。'
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { charset: 'utf-8' },
        { property: 'og:title', content: 'Tortoise' },
        { property: 'og:description', content: 'このサービスはプレゼンを時間通りに進めるためのツールです。うさぎ（🐰 スライドの進捗）とカメ（🐢 時間）でそれぞれが進み、現時点のスライドの進捗を可視化することができます。' },
        { property: 'og:image', content: 'https://tortoise.ohmygod.jp/og.png' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Tortoise' },
        { name: 'twitter:description', content: 'このサービスはプレゼンを時間通りに進めるためのツールです。うさぎ（🐰 スライドの進捗）とカメ（🐢 時間）でそれぞれが進み、現時点のスライドの進捗を可視化することができます。' },
        { name: 'twitter:image', content: 'https://tortoise.ohmygod.jp/og.png' }
      ]
    }
  }
})