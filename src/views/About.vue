<template>
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 relative">
            <div class="kawaii-border mb-12"></div>
        </div>

        <section class="bg-white bg-opacity-50 p-4 sm:p-6 rounded-3xl shadow-lg mb-8">
            <h2 class="text-xl sm:text-2xl font-bold mb-4 text-kawaii-green-700">{{ $t('about.title') }}</h2>
            <div class="text-sm sm:text-base space-y-4">
                <p class="text-kawaii-blue-800 relative z-10">
                    {{ $t('about.content') }}
                </p>
                <p class="relative z-10">
                    <span class="font-bold text-kawaii-purple-600">{{ $t('about.intro') }}</span>
                    <span class="font-bold">
                        <span class="text-xs align-top text-kawaii-pink-500">@kjch</span>
                        (<span class="text-blue-500 font-bold">K</span><span class="text-sm">uang</span>
                        <span class="text-blue-500 font-bold">J</span><span class="text-sm">ia</span>
                        <span class="text-blue-500 font-bold">CH</span><span class="text-sm">eng</span>)
                    </span>
                </p>
                <p class="text-kawaii-blue-700">{{ $t('about.description') }}</p>
                <p class="text-kawaii-green-600">{{ $t('about.current') }}</p>
                <p class="text-kawaii-orange-500">{{ $t('about.interest') }}</p>
                <p class="text-kawaii-pink-600 font-semibold">{{ $t('about.hope') }}</p>
            </div>
        </section>

        <section class="bg-white bg-opacity-50 p-4 sm:p-6 rounded-3xl shadow-lg mb-8">
            <h2 class="text-xl sm:text-2xl font-bold mb-4 text-kawaii-orange-500">{{ $t('skills.title') }}</h2>
            <p class="text-sm sm:text-base mb-4 text-kawaii-blue-700">
                Some of the following include skills I'm just starting to learn or have just gotten some basic knowledge
                of,
                while others I've already mastered (mostly website front-end, various tools, and design software).
            </p>
            <div v-for="(category, index) in skillCategories" :key="index" class="mb-6">
                <h3 class="text-lg font-semibold mb-2 text-kawaii-purple-600">{{ category.name }}</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div v-for="(skill, skillIndex) in category.skills" :key="skillIndex"
                        class="flex flex-col items-center">
                        <Icon :icon="skill.icon" class="w-8 h-8 mb-1" />
                        <span class="text-xs text-center">{{ skill.name }}</span>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { t, locale } = useI18n()

const setTitle = () => {
    document.title = t('pageTitle')
}

onMounted(() => {
    setTitle()
})

watch(locale, () => {
    setTitle()
})

const skillCategories = [
    {
        name: 'Frontend',
        skills: [
            { name: 'CSS3', icon: 'vscode-icons:file-type-css' },
            { name: 'HTML5', icon: 'vscode-icons:file-type-html' },
            { name: 'JavaScript', icon: 'logos:javascript' },
            { name: 'TypeScript', icon: 'logos:typescript-icon' },
            { name: 'Vue.js', icon: 'logos:vue' },
            { name: 'Vite', icon: 'vscode-icons:file-type-vite' },
            { name: 'Nuxt.js', icon: 'logos:nuxt-icon' },
            { name: 'React', icon: 'logos:react' },
            { name: 'Bootstrap', icon: 'logos:bootstrap' },
            { name: 'Sass', icon: 'logos:sass' },
            { name: 'jQuery', icon: 'logos:jquery' },
            { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
            { name: 'Chart.js', icon: 'logos:chartjs' },
        ],
    },
    {
        name: 'Backend/Programming Languages',
        skills: [
            { name: 'PHP', icon: 'logos:php' },
            { name: 'MongoDB', icon: 'logos:mongodb-icon' },
            { name: 'Node.js', icon: 'logos:nodejs-icon' },
            { name: 'Nginx', icon: 'logos:nginx' },
            { name: 'Python', icon: 'logos:python' },
            { name: 'MySQL', icon: 'logos:mysql-icon' },
            { name: 'Flask', icon: 'logos:flask' },
            { name: 'Lua', icon: 'logos:lua' },
            { name: 'C#', icon: 'logos:c-sharp' },
            { name: 'Strapi', icon: 'logos:strapi-icon' },
        ],
    },
    {
        name: 'DevOps',
        skills: [
            { name: 'VS Code', icon: 'vscode-icons:file-type-vscode' },
            { name: 'Bash', icon: 'logos:bash-icon' },
            { name: 'Git', icon: 'logos:git-icon' },
            { name: 'GitHub Codespaces', icon: 'devicon:githubcodespaces' },
            { name: 'GitLab', icon: 'logos:gitlab' },
            { name: 'PowerShell', icon: 'vscode-icons:file-type-powershell' },
            { name: 'Docker', icon: 'logos:docker-icon' },
            { name: 'AWS', icon: 'logos:aws' },
            { name: 'Google Cloud', icon: 'logos:google-cloud' },
            { name: 'LaTeX', icon: 'devicon:latex' },
            { name: 'Blender', icon: 'logos:blender' },
            { name: 'WordPress', icon: 'logos:wordpress-icon' },
            { name: 'Unity', icon: 'logos:unity' },
        ],
    },
    {
        name: 'Operating Systems',
        skills: [
            { name: 'Linux', icon: 'logos:linux-tux' },
            { name: 'Windows', icon: 'logos:microsoft-windows' },
            { name: 'Android', icon: 'logos:android-icon' },
            { name: 'Raspberry Pi', icon: 'logos:raspberry-pi' },
            { name: 'Ubuntu', icon: 'logos:ubuntu' },
            { name: 'CentOS', icon: 'logos:centos-icon' },
        ],
    },
    {
        name: 'Design Tools',
        skills: [
            { name: 'Illustrator', icon: 'vscode-icons:file-type-ai' },
            { name: 'InDesign', icon: 'logos:adobe-indesign' },
            { name: 'Premiere Pro', icon: 'logos:adobe-premiere' },
            { name: 'Photoshop', icon: 'logos:adobe-photoshop' },
            { name: 'Dreamweaver', icon: 'logos:adobe-dreamweaver' },
            { name: 'After Effects', icon: 'logos:adobe-after-effects' },
            { name: 'Figma', icon: 'logos:figma' },
            { name: 'AutoCAD', icon: 'simple-icons:autocad' },
            { name: 'SolidWorks', icon: 'mdi:design' },
        ],
    },
    {
        name: 'Operation and Maintenance',
        skills: [
            { name: 'SSH', icon: 'devicon:ssh-wordmark' },
            { name: 'FileZilla', icon: 'devicon:filezilla' },
            { name: 'Fortinet', icon: 'simple-icons:fortinet' },
            { name: '雷池WAF', icon: 'mdi:security' },
            { name: 'BT Panel', icon: 'mdi:server' },
            { name: 'VMware vSphere', icon: 'logos:vmware' },
        ],
    },
]
</script>

<style scoped>
.kawaii-border {
    background-image: repeating-linear-gradient(45deg, #A2D2FF, #A2D2FF 10px, #BDE0FE 10px, #BDE0FE 20px);
    height: 10px;
    width: 100%;
}
</style>