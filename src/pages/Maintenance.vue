<template>
  <div class="_pageLoad _maintenance">
    <div class="bluring-t"></div>
    <div class="bluring-b"></div>
    <div class="_load-bg">
      <div class="_load-glow _load-glow--1"></div>
      <div class="_load-glow _load-glow--2"></div>
      <div class="_load-glow _load-glow--3"></div>
    </div>
    <div class="_load-center">
      <div class="_maint-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <div class="_maint-text">
        <h3>{{ $t('app.maintenanceTitle') }}</h3>
        <p>{{ $t('app.maintenanceDesc') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
