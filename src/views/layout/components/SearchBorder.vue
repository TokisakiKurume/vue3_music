<script setup>
import { ref, nextTick, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { musicGetSearchInfo } from '@/api/music'
import EventBus from '@/utils/EventBus'

const input = ref('')
const router = useRouter()
const route = useRoute()
const emit = defineEmits(['pass-data-to-parent'])

// 父传子数据
const props = defineProps({
  content: String,
  pageNumber: Number
})

// 获取后端数据的查询条件
const data = reactive({
  str: input.value.trim(),
  pageSize: 20,
  pageNumber: 1
})

// 搜索点击事件
const search = async () => {
  data.str = input.value.trim()
  router.push(`/music/search/${data.str}`)
  const res = await musicGetSearchInfo(data)
  // 将返回的数据传递给父组件
  const result = {
    ...res.data.data,
    pageSize: data.pageSize,
    pageNumber: data.pageNumber
  }
  emit('pass-data-to-parent', result)

  // 发出自定义事件，携带搜索结果
  EventBus.$emit('search-completed', result)
}

// 根据路径判断当前页面， 将路径值返回到组件上
if (router.currentRoute.value.path.split('/')[2] === 'search') {
  input.value = route.params.string
  search()
}
// 搜索详情页头部的组件显示
nextTick(() => {
  if (props.content) input.value = props.content
})
watch(
  () => route.params.string,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      input.value = newValue
    }
  }
)

// 监听页数变化
watch(
  () => props.pageNumber,
  (newValue) => {
    data.pageNumber = newValue
    search()
  }
)
</script>

<template>
  <el-input
    v-model="input"
    placeholder="歌曲名 / 歌手名"
    class="input"
    @keyup.enter="search"
  >
    <template #append>
      <el-button :icon="Search" @click="search" />
    </template>
  </el-input>
</template>

<style lang="scss" scoped>
.input {
  --el-input-focus-border-color: rgb(220, 223, 230);
  padding: 0 10px;
  width: 260px;
}
</style>
