<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Welcome to TONRIS
          </h1>
          <p class="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Your intelligent AI assistant platform for streamlined workflows and enhanced productivity.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink to="/register">
              <Button
                label="Get Started Free"
                icon="pi pi-arrow-right"
                icon-pos="right"
                size="large"
                class="px-8 py-3"
              />
            </RouterLink>
            <RouterLink to="/login">
              <Button
                label="Sign In"
                severity="secondary"
                outlined
                size="large"
                class="px-8 py-3"
              />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to boost your productivity and streamline your workflow.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <i class="pi pi-bolt text-3xl text-indigo-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p class="text-gray-600">
              Get instant responses with our optimized AI infrastructure.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <i class="pi pi-shield text-3xl text-green-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
            <p class="text-gray-600">
              Enterprise-grade security with end-to-end encryption.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <i class="pi pi-users text-3xl text-purple-600"></i>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
            <p class="text-gray-600">
              Work together seamlessly with multi-tenant workspace support.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p class="text-lg text-gray-600 mb-8">
          Join thousands of users who are already using TONRIS to power their workflows.
        </p>
        <RouterLink to="/register">
          <Button
            label="Start Your Free Trial"
            icon="pi pi-arrow-right"
            icon-pos="right"
            size="large"
            class="px-8 py-3"
          />
        </RouterLink>
      </div>
    </section>
  </div>
</template>
