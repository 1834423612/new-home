<template>
    <div ref="socialLinksRef" class="relative">
        <ul class="flex space-x-4">
            <li v-for="link in socialLinks" :key="link.name" class="relative group">
                <template v-if="!link.isSpecial">
                    <a :href="link.url" target="_blank" rel="noopener noreferrer"
                        @click.prevent="handleClick(link.name)" @mouseenter="handleMouseEnter(link.name)"
                        @mouseleave="handleMouseLeave(link.name)"
                        class="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-200 transition transform hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
                        :style="{ backgroundColor: link.color }">
                        <icon :icon="link.icon" class="text-white text-2xl transition-transform duration-300" />
                    </a>
                </template>
                <template v-else>
                    <div @click="handleClick(link.name)" @mouseenter="handleMouseEnter(link.name)"
                        @mouseleave="handleMouseLeave(link.name)"
                        class="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-200 transition transform hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer"
                        :style="{ backgroundColor: link.color }">
                        <icon :icon="link.icon" class="text-white text-2xl transition-transform duration-300" />
                    </div>
                </template>
                <!-- Tooltip 使用 TailwindCSS 类 -->
                <div v-if="activeTooltip === link.name"
                    class="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded shadow-lg transition-opacity duration-300 z-10">
                    <template v-if="link.isSpecial">
                        <p>{{ link.tooltip }}</p>
                        <img v-if="link.image" :src="link.image" alt="WeChat QR Code" class="mt-2 w-24 h-24" />
                    </template>
                    <template v-else>
                        {{ link.tooltip }}
                    </template>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const socialLinks = ref([
    {
        name: 'WeChat',
        url: '#',
        icon: 'ri:wechat-fill',
        color: '#5bc215',
        tooltip: t('socialLinks.wechatTooltip'),
        isSpecial: true,
        image: 'https://placehold.co/120x120/pink/white?text=Test+QR+Code' // 微信二维码路径
    },
    {
        name: 'QQ',
        url: 'http://wpa.qq.com/msgrd?v=3&uin=1834423612&site=qq&menu=yes',
        icon: 'ri:qq-fill',
        color: '#66ccff',
        tooltip: t('socialLinks.qqTooltip'),
        isSpecial: false
    },
    {
        name: 'Telegram',
        url: 'https://t.me/kjch666',
        icon: 'ri:telegram-fill',
        color: '#0088cc',
        tooltip: t('socialLinks.telegramTooltip'),
        isSpecial: false
    },
    {
        name: 'Email',
        url: 'mailto:KevinKuang2007@gmail.com',
        icon: 'ri:mail-fill',
        color: '#F58930',
        tooltip: t('socialLinks.emailTooltip'),
        isSpecial: false
    },
    {
        name: 'Twitter',
        url: 'https://twitter.com/kevinkuang2007',
        icon: 'ri:twitter-fill',
        color: '#28a9e0',
        tooltip: t('socialLinks.twitterTooltip'),
        isSpecial: false
    },
    {
        name: 'Bilibili',
        url: 'https://space.bilibili.com/267388489',
        icon: 'ri:bilibili-fill',
        color: '#f09199',
        tooltip: t('socialLinks.bilibiliTooltip'),
        isSpecial: false
    },
    {
        name: '网易云音乐',
        url: 'https://music.163.com/#/user/home?id=586229528',
        icon: 'ri:netease-cloud-music-fill',
        color: '#f12d35',
        tooltip: t('socialLinks.neteaseTooltip'),
        isSpecial: false
    },
    {
        name: 'GitHub',
        url: 'https://github.com/1834423612',
        icon: 'ri:github-fill',
        color: '#555',
        tooltip: t('socialLinks.githubTooltip'),
        isSpecial: false
    },
    {
        name: 'Steam',
        url: 'https://steamcommunity.com/profiles/76561199375887525/',
        icon: 'ri:steam-fill',
        color: '#b600ff',
        tooltip: t('socialLinks.steamTooltip'),
        isSpecial: false
    },
    {
        name: 'Instagram',
        url: 'https://www.instagram.com/kjch0720/',
        icon: 'ri:instagram-fill',
        color: '#f700bf',
        tooltip: t('socialLinks.instagramTooltip'),
        isSpecial: false
    },
    {
        name: 'Threads',
        url: 'https://www.threads.net/@kjch0720',
        icon: 'ri:threads-fill',
        color: '#000000',
        tooltip: t('socialLinks.threadsTooltip'),
        isSpecial: false
    }
])

const activeTooltip = ref('')
const tooltipMode = ref<'hover' | 'click' | ''>('') // 'hover' or 'click'
const socialLinksRef = ref<HTMLElement | null>(null)

const showTooltip = (name: string, mode: 'hover' | 'click') => {
    activeTooltip.value = name
    tooltipMode.value = mode
}

const hideTooltip = () => {
    activeTooltip.value = ''
    tooltipMode.value = ''
}

const handleMouseEnter = (name: string) => {
    if (tooltipMode.value !== 'click') {
        showTooltip(name, 'hover')
    }
}

const handleMouseLeave = (name: string) => {
    if (tooltipMode.value === 'hover' && activeTooltip.value === name) {
        hideTooltip()
    }
}

const handleClick = (name: string) => {
    if (activeTooltip.value === name && tooltipMode.value === 'click') {
        hideTooltip()
    } else {
        showTooltip(name, 'click')
    }
}

const handleClickOutside = (event: MouseEvent) => {
    if (
        socialLinksRef.value &&
        !socialLinksRef.value.contains(event.target as Node)
    ) {
        hideTooltip()
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>
