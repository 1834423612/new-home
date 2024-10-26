<template>
    <div class="bg-white bg-opacity-50 p-4 sm:p-6 rounded-3xl shadow-lg mb-8">
        <h3 class="text-xl font-bold mb-4 text-kawaii-purple-600 sm:text-lg">{{ $t('rollTags.title') }}</h3>
        <button @click="rollTags"
            class="w-auto px-6 py-3 bg-kawaii-pink-400 text-white rounded-full hover:bg-kawaii-pink-500 transition-all duration-300 mb-6 shadow-md hover:shadow-lg transform hover:scale-105 sm:px-4 sm:py-2 sm:text-sm focus:outline-none focus:ring-2 focus:ring-kawaii-pink-300 focus:ring-opacity-50">
            {{ $t('rollTags.button') }}
        </button>
        <div class="relative h-12 overflow-hidden rounded-full sm:h-10">
            <transition-group name="roll" tag="div" class="absolute inset-0">
                <div v-for="(tag, index) in visibleTags" :key="tag + index"
                    class="absolute inset-0 flex items-center">
                    <span
                        class="bg-white px-4 py-2 rounded-full inline-flex items-center text-lg font-semibold shadow-md sm:text-sm"
                        :style="{ color: getRandomColor() }">
                        <Icon icon="mdi:pound" class="w-4 h-4 mr-1" />
                        {{ tag }}
                    </span>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t } = useI18n()

const allTags = [
    // 定义
    '内向却又有些外向', '喜欢狗狗', '善良', '生于河北', '来自北京',
    // 生活
    '熬夜冠军', '躺平爱好者', '一般通过路人', '话痨',
    // 动画 & 游戏
    '❤Minecraft', 'Steam白嫖爱好者',
    'Terraria(泰拉瑞亚)', '猫和老鼠',
    // 技术
    'PHP 小白', '熟练掌握html', 'JavaScript 入门',
    'Adobe 全家桶用户', 'VSCode 用户', 'Notepad 用户', 'Windows 用户',
    '开源轮子用户', '在该用 Linux 的时候使用 Linux',
    // 职业
    '日常摸鱼学生', '喜欢编程', '愿望是上学期间睡个好觉',
    // 文化
    '泛二次元（？）', '在亚文化海洋一边游泳一边喝水', '世界系作品爱好者', '次文化的主流群众',
    '钦点见习膜法师', '多元思维推崇者', '爱与和平', '爱好和平', '反向思维',
    '什么类型都可以吃一点',
    // 设备&工具
    '麦当劳与KFC通吃', 'LENOVO Legion用户', 'Linux服务器用户',
    '米粉', '微软大法好', '垃圾佬', '二手爱好者', '洋垃圾爱好者', '魔改硬件爱好者',
    '装机猿', '瞎折腾',
    // 短句
    '你记住我了吗，当你试着多roll几个标签的时候，我就赢了☜(ﾟヮﾟ☜)',
    '刚刚走神了，这个不算，再roll一个',
    '你很幸运，roll到了这个毫无意义的标签，请再roll一个',
    '感谢来访这个无名的小站点，祝你有个美好的一天~'
]

const visibleTags = ref<string[]>([t('rollTags.defaultTag')])
const isRolling = ref(false)

const getRandomColor = () => {
    const colors = ['#ff868b', '#fb997c', '#bb61da', '#FCB69F', '#85b9e9', '#67d7af', '#6f90f1']
    return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * 模拟标签滚动效果的函数。
 * 
 * 该函数启动一个滚动效果，在一定次数内随机选择并显示标签，然后停止。滚动效果由一个定时器控制，
 * 该定时器以固定的频率更新可见标签。
 * 
 * - `isRolling.value`: 一个响应式布尔值，指示滚动效果当前是否处于活动状态。
 * - `visibleTags.value`: 一个响应式数组，保存当前可见的标签。
 * - `allTags`: 包含所有可能显示标签的数组。
 * 
 * 该函数执行以下步骤：
 * 1. 检查滚动效果是否已经处于活动状态。如果是，函数提前退出。
 * 2. 将 `isRolling.value` 设置为 `true`，以指示滚动效果现在处于活动状态。
 * 3. 初始化一个计数器以跟踪滚动次数。
 * 4. 通过将一个随机数（0到19之间）加到15来确定最大滚动次数。
 * 5. 设置一个定时器，该定时器：
 *    - 从 `allTags` 中随机选择一个标签，并用选定的标签更新 `visibleTags.value`。
 *    - 递增计数器。
 *    - 检查计数器是否已达到最大滚动次数。如果是，清除定时器并将 `isRolling.value` 设置为 `false`。
 * 
 * 定时器每90毫秒更新一次可见标签。
 */
const rollTags = () => {
    if (isRolling.value) return
    isRolling.value = true
    let counter = 0
    const maxRolls = 15 + Math.floor(Math.random() * 20)
    const interval = setInterval(() => {
        visibleTags.value = [allTags[Math.floor(Math.random() * allTags.length)]]
        counter++
        if (counter >= maxRolls) {
            clearInterval(interval)
            isRolling.value = false
        }
    }, 90)
}
</script>

<style scoped>
.roll-enter-active,
.roll-leave-active {
    transition: all 0.1s;
}

.roll-enter-from {
    transform: translateY(100%);
    opacity: 0;
}

.roll-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}
</style>