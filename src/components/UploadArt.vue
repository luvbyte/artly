<script setup>
  import { ref } from "vue";

  import { createArt } from "@/api";
  import { isPlainText } from "@/utils";

  const emit = defineEmits(["close"]);

  const uploading = ref(false);
  const form = ref({
    title: "",
    author: "",
    content: "",
    tags: []
  });

  const errors = ref({
    message: ""
  });

  const tagInput = ref("");

  const addTag = () => {
    tagInput.value
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean)
      .forEach(tag => {
        if (!form.value.tags.includes(tag)) {
          form.value.tags.push(tag);
        }
      });

    tagInput.value = "";
  };

  const removeTag = index => {
    form.value.tags.splice(index, 1);
  };

  async function uploadFile() {
    errors.value.message = "";

    if (!form.value.content.trim()) {
      errors.value.message = "Content is required";
      return;
    }

    if (isPlainText(form.value.content.trim())) {
      errors.value.message = "Where art? All I see is words 👀";
      return;
    }

    uploading.value = true;

    try {
      await createArt({
        title: form.value.title,
        author: form.value.author,
        content: form.value.content,
        tags: form.value.tags
      });

      form.value = {
        title: "",
        author: "",
        content: "",
        tags: []
      };

      tagInput.value = "";

      location.reload();
    } catch (err) {
      console.error(err);
      errors.value.message = err.message || "Failed to upload art";
    } finally {
      uploading.value = false;
    }
  }
</script>

<template>
  <div
    class="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    @click="emit('close')"
  >
    <div
      class="card bg-base-100 w-full max-w-xl shadow-2xl overflow-y-auto"
      @click.stop
    >
      <div class="card-body p-6 md:p-8">
        <div class="space-y-2">
          <!-- Title -->
          <div>
            <label class="label">
              <span class="label-text font-medium"> Title </span>
            </label>

            <input
              v-model="form.title"
              type="text"
              maxlength="100"
              class="input input-bordered w-full focus:outline-none placeholder:opacity-60"
              placeholder="Cute face"
            />

            <label class="label">
              <span class="label-text-alt opacity-60">
                {{ form.title.length }}/100
              </span>
            </label>
          </div>

          <!-- Author + Tags -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label class="label">
                <span class="label-text"> Author </span>
              </label>

              <input
                v-model="form.author"
                type="text"
                class="input input-bordered w-full focus:outline-none placeholder:opacity-60"
                placeholder="Your name"
              />
            </div>

            <div class="space-y-2">
              <!-- Tags -->
              <div v-if="form.tags.length" class="flex flex-wrap gap-2">
                <div
                  v-for="(tag, index) in form.tags"
                  :key="tag"
                  class="badge badge-primary gap-2 py-3"
                >
                  {{ tag }}

                  <button type="button" @click="removeTag(index)">✕</button>
                </div>
              </div>

              <!-- Input + Add Button -->
              <div class="flex gap-2">
                <input
                  v-model="tagInput"
                  type="text"
                  class="input input-bordered flex-1 focus:outline-none placeholder:opacity-60"
                  placeholder="Add a tag"
                  @keydown.enter.prevent="addTag"
                />

                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="!tagInput.trim()"
                  @click="addTag"
                >
                  Add
                </button>
              </div>

              <p class="text-xs opacity-60">Press Enter or tap Add</p>
            </div>
          </div>

          <!-- Text Area -->
          <div class="pt-2">
            <textarea
              v-model="form.content"
              class="textarea textarea-primary h-64 w-full placeholder:opacity-60"
              placeholder="Paste your ASCII art here..."
            ></textarea>

            <div class="text-right text-xs opacity-60 mt-1">
              {{ form.content.length }} characters
            </div>
          </div>

          <!-- Error -->
          <div v-if="errors.message" class="alert alert-error">
            <span>{{ errors.message }}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="card-actions justify-end mt-6">
          <button class="btn btn-ghost" @click="emit('close')">Cancel</button>

          <button
            class="btn btn-primary min-w-36"
            :disabled="uploading"
            @click="uploadFile"
          >
            <svg
              v-if="uploading"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path
                fill="currentColor"
                d="M12 2A10 10 0 1 0 22 12A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8A8 8 0 0 1 12 20Z"
                opacity=".5"
              />
              <path
                fill="currentColor"
                d="M20 12h2A10 10 0 0 0 12 2V4A8 8 0 0 1 20 12Z"
              >
                <animateTransform
                  attributeName="transform"
                  dur="1s"
                  from="0 12 12"
                  repeatCount="indefinite"
                  to="360 12 12"
                  type="rotate"
                />
              </path>
            </svg>

            {{ uploading ? "Uploading..." : "Upload" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
