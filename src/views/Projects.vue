<template>
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <section class="mb-8">
            <h2 class="text-2xl font-bold mb-4 text-kawaii-purple-500">{{ $t('projects.title') }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ProjectCard from '../components/ProjectCard.vue'
import projectsData from '../data/projects.json'

const { t: _ } = useI18n()

const projects = ref(projectsData)
</script>