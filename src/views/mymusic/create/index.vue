<script setup>
import ShowSheet from '@/views/mymusic/components/SheetShow.vue'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { createSheetByUser } from '@/api/sheet'

const router = useRouter()

// 新建歌单
const newSheet = () => {
  router.push('/mymusic/sheet_edit')
}

// 获取用户创建的歌单数据
const data = ref([
  {
    sheet_id: '',
    sheet_name: '',
    sheet_picSrc: '',
    user: {
      user_name: '',
      user_nick: ''
    }
  }
])
const getData = async () => {
  const res = await createSheetByUser()
  data.value = res.data.data
}
getData()
// 监听子组件的删除事件重新获取数据
const reload = () => {
  getData()
}
</script>

<template>
  <div class="create">
    <div class="add" @click="newSheet">
      <span>
        <i class="iconfont icon-add" style="color: #808080"></i> 新建歌单
      </span>
    </div>
    <div class="container">
      <ShowSheet
        v-show="data?.length > 0"
        v-for="(item, index) in data"
        :key="index"
        :sheet="item"
        @reload="reload"
      ></ShowSheet>
    </div>
  </div>
  <el-empty
    description="暂无创建的歌单哟！"
    :image-size="200"
    v-show="data?.length <= 0"
  ></el-empty>
</template>

<style scoped lang="scss">
.create {
  width: 1200px;
  margin: auto;
  display: flex;
  flex-direction: column;

  .add {
    margin-left: auto;
    margin: 20px 0 20px auto;
    border: 1px solid #c9c9c9;
    padding: 5px 10px;
    border-radius: 20px;
    cursor: pointer;

    &:hover {
      background-color: #ededed;
    }
  }

  .container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
