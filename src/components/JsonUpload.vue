<template>
  <v-file-input
    label="Upload JSON"
    accept="application/json"
    prepend-icon="mdi-upload"
    density="comfortable"
    @change="onFile" />
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e:'loaded', data:any): void }>()

function onFile(e: any){
  const file = e.target?.files?.[0] || e.target?.[0]
  if(!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try{
      const json = JSON.parse(String(reader.result))
      emit('loaded', json)
    }catch(err){ alert('Invalid JSON') }
  }
  reader.readAsText(file)
}
</script>
