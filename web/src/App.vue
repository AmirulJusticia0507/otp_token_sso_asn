<script setup>
// Shell T-01.1: halaman penuh diisi RouterView, navigasi menyusul di T-02.
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b bg-white">
      <div class="mx-auto max-w-5xl px-4 py-3">
        <h1 class="text-lg font-semibold">Pengelolaan Barang — DIY-Gov</h1>
      </div>
    </header>
    <main class="mx-auto max-w-5xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
