<script>
  import "../app.css";
</script>

<header class="bg-white">
  <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
      <a href="/" class="text-lg font-semibold leading-6 text-gray-900">Home</a>
      <a href="/analytics" class="text-lg font-semibold leading-6 text-gray-900">Analytics</a>
  </nav>
</header>
<main >
  <div class="items-center text-center">
    <slot></slot>
  </div>
</main>
