<template>
  <div class="flex-1 p-2 gap-3 flex flex-col overflow-hidden">
    <div class="bg-base-100 border-b border-base-300">
      <div class="max-w-7xl mx-auto px-2 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-extrabold">Artly</h1>
            <p class="text-xs opacity-60">Ascii arts & emoticons</p>
          </div>

          <div class="flex gap-2">
            <button
              @click="showSidebar = true"
              class="btn btn-circle btn-outline btn-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
              >
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-width="3"
                  d="M17.58 9.71a6 6 0 0 0-7.16 3.58m7.16-3.58A6 6 0 1 1 12 19.972M17.58 9.71a6 6 0 1 0-11.16 0m4 3.58A6 6 0 0 0 10 15.5c0 1.777.773 3.374 2 4.472m-1.58-6.682a6.01 6.01 0 0 1-4-3.58m0 0A6 6 0 1 0 12 19.972"
                />
              </svg>
            </button>

            <button
              @click="uploader = true"
              class="btn btn-primary btn-sm px-5"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <input
        v-model="search"
        class="w-full input input-sm rounded focus:outline-none placeholder:opacity-60"
        placeholder="Search by tag"
      />
      <div
        v-if="search.length > 0"
        @click="search = ''"
        class="absolute right-2 top-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path
            fill="currentColor"
            d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
          />
        </svg>
      </div>
    </div>

    <!-- Popular tags -->
    <div class="flex gap-2 overflow-x-auto scrollbar-hide">
      <div class="flex gap-2">
        <button
          @click="showRandomArt"
          class="btn btn-xs btn-primary rounded-sm"
          :disabled="loading"
        >
          Random
        </button>
        <button
          @click="loadInitial"
          class="btn btn-xs btn-primary rounded-sm"
          :disabled="loading"
        >
          Latest
        </button>
      </div>

      <button
        v-for="tag in popularTags"
        class="badge rounded-sm transition-all duration-300 border-base-content/20"
        :disabled="loading"
        :class="
          search.trim().toLowerCase() === tag.trim().toLowerCase()
            ? 'badge-info'
            : 'badge-outline'
        "
        @click="search = tag"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Media Grid -->
    <div class="flex-1 overflow-y-auto" ref="scrollContainer">
      <div
        class="grid gap-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div
          v-if="!loading && arts.length <= 0"
          class="p-2 opacity-60 text-center"
        >
          No arts found
        </div>
        <ArtCard v-for="art in arts" :key="art.id" :art="art" />
      </div>

      <div ref="sentinel" class="h-10"></div>

      <div v-if="loading" class="p-2 flex justify-center">
        <Loading />
      </div>

      <div v-if="!hasMore && arts.length" class="text-center opacity-50 py-4">
        No more arts
      </div>
    </div>
    <!-- Upload Art -->
    <Transition name="fade-scale">
      <UploadArt v-if="uploader" @close="uploader = false" />
    </Transition>

    <!-- Sidebar -->
    <div
      class="fixed inset-0 z-20 full overflow-hidden"
      @click.self="showSidebar = false"
      :class="{ 'pointer-events-none -z-20': !showSidebar }"
    >
      <!-- SIDEBAR -->
      <Transition name="slide-right">
        <div v-show="showSidebar" class="relative h-full w-3/4 sm:w-1/2 glass">
          <Sidebar />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, onMounted, onUnmounted } from "vue";

  import ArtCard from "@/components/ArtCard.vue";
  import Sidebar from "@/components/Sidebar.vue";
  import UploadArt from "@/components/UploadArt.vue";
  import Loading from "@/components/Loading.vue";

  import {
    getLatestArts,
    loadMoreArts,
    searchArtsByTag,
    getRandomArts
  } from "@/api";

  const popularTags = ["Emoticon", "Ascii", "Unicode"];

  const search = ref("");
  const showSidebar = ref(false);
  const uploader = ref(false);

  const arts = ref([]);

  const sentinel = ref();
  const scrollContainer = ref();

  const lastDoc = ref(null);
  const hasMore = ref(true);
  const loading = ref(false);

  let observer;

  let searchTimeout;

  function selectTag(tag) {
    search.value = tag;
  }

  watch(search, value => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      const tag = value.trim().toLowerCase();

      if (!tag) {
        await loadInitial();
        return;
      }

      loading.value = true;

      try {
        const result = await searchArtsByTag({
          tag
        });

        arts.value = result.items;
        lastDoc.value = result.lastDoc;
        hasMore.value = result.hasMore;
      } finally {
        loading.value = false;
      }
    }, 600);
  });

  async function showRandomArt() {
    loading.value = true;

    try {
      const randomArts = await getRandomArts(5);

      if (!randomArts.length) {
        arts.value = [];
        hasMore.value = false;
        return;
      }

      arts.value = randomArts;

      lastDoc.value = null;
      hasMore.value = false;
    } finally {
      loading.value = false;
    }
  }

  async function loadInitial() {
    loading.value = true;

    try {
      const result = await getLatestArts();

      arts.value = result.items;
      lastDoc.value = result.lastDoc;
      hasMore.value = result.hasMore;
    } finally {
      loading.value = false;
    }
  }

  async function loadMore() {
    if (loading.value || !hasMore.value) return;

    loading.value = true;

    try {
      let result;

      if (search.value.trim()) {
        result = await searchArtsByTag({
          tag: search.value.trim(),
          lastDoc: lastDoc.value
        });
      } else {
        result = await loadMoreArts(lastDoc.value);
      }

      arts.value.push(...result.items);

      lastDoc.value = result.lastDoc;
      hasMore.value = result.hasMore;
    } finally {
      loading.value = false;
    }
  }

  onMounted(async () => {
    await loadInitial();

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: scrollContainer.value,
        rootMargin: "300px",
        threshold: 0.1
      }
    );

    if (sentinel.value) {
      observer.observe(sentinel.value);
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });
</script>
