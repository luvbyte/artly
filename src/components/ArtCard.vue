<template>
  <div
    class="relative border rounded border-base-content/20 opacity-80 p-4 flex items-center justify-center cursor-pointer active:scale-[0.99] hover:border-primary transition-all"
    @click="copyArt"
  >
    <span
      v-if="copied"
      class="absolute top-2 right-2 text-xs text-success font-medium badge"
    >
      Copied
    </span>

    <pre class="text-xs whitespace-pre-wrap break-all overflow-hidden"
      >{{ art.content }}</pre>
  </div>
</template>

<script setup>
  import { ref } from "vue";

  const props = defineProps({
    art: {
      type: Object,
      required: true
    }
  });

  const copied = ref(false);
  let timer;

  async function copyArt() {
    try {
      await navigator.clipboard.writeText(props.art.content);

      copied.value = true;

      clearTimeout(timer);
      timer = setTimeout(() => {
        copied.value = false;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  }
</script>
