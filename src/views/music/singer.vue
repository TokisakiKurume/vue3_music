<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getSingerAllInfo } from '@/api/singer'

// 选择栏 info
const letters = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  '#'
]
// 分页组件数据
const pagination = reactive({
  total: '', // 歌手总数量
  page_size: 24, // 每页歌手展示数量
  current_page: 1 // 当前页码
})
// 后端查询数据集
const data = reactive({
  letter: null, // 查询全部时需指定该字段为 false
  pageSize: pagination.page_size,
  pageNumber: pagination.current_page,
  not: null // 针对 letter 为 # 字符时需要设置
})

// 选择栏渲染
const select = async (e) => {
  const active = document.querySelector('.select .active')
  active.classList.remove('active')
  e.target.classList.add('active')
  // TODO 获取对应的歌手数据
  if (e.target.dataset.select === 'all') {
    data.letter = null
    data.not = null
    getData(data)
  } else if (e.target.dataset.select === '#') {
    data.letter = letters.filter((char) => char !== '#')
    data.not = 'not'
    getData(data)
  } else {
    data.letter = [e.target.dataset.select]
    data.not = null
    getData(data)
  }
}

// 路径跳转
const router = useRouter()
const jumpSingerDetail = (id) => {
  router.push(`/music/singer/singer_detail/${id}`)
}

// 获取后端数据
const list_main = ref() // 前八位主要数据展示
const list = ref() // 后续歌手展示

const getData = async (data) => {
  let res = await getSingerAllInfo(data)
  res = res.data.data
  list_main.value = res.top_data
  list.value = res.data
  pagination.total = res.total
}
getData(data)
// 监听页码变化，重新向后端获取数据并渲染
watch([() => data, () => pagination.current_page], async (val) => {
  val[0].pageNumber = val[1]
  await getData(val[0])
})
</script>

<template>
  <div class="container">
    <ul class="select">
      <li class="active" data-select="all" @click="select">全部</li>
      <li
        v-for="(item, index) in letters"
        :key="index"
        :data-select="item"
        @click="select"
      >
        {{ item }}
      </li>
    </ul>
    <div class="main-singer" v-show="Array.isArray(list_main)">
      <div v-for="(item, index) in list_main" :key="index">
        <el-avatar
          :size="150"
          :src="
            item.singer_picSrc || `https://picsum.photos/225?${item.singer_id}`
          "
          @click="jumpSingerDetail(item.singer_id)"
        />
        <p @click="jumpSingerDetail(item.singer_id)">
          {{ item.singer_name }}
        </p>
      </div>
    </div>
    <el-empty
      description="暂无歌手记录，可以联系管理员添加喜欢的歌手和歌曲哦~"
      style="margin-top: -300px"
      :image-size="200"
      v-show="list_main?.length === 0"
    />
    <div class="example-pagination-block">
      <div class="example-demonstration">
        <div v-for="(item, index) in list" :key="index" class="outbox">
          <el-avatar
            :size="50"
            :src="
              item.singer_picSrc ||
              `https://picsum.photos/225?${item.singer_id}`
            "
            @click="jumpSingerDetail(item.singer_id)"
          />
          <p @click="jumpSingerDetail(item.singer_id)">
            {{ item.singer_name }}
          </p>
        </div>
      </div>
      <el-pagination
        layout="prev, pager, next"
        :total="parseInt(pagination.total)"
        :page-size="parseInt(pagination.page_size)"
        :background="true"
        :hide-on-single-page="true"
        v-model:current-page="pagination.current_page"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 1500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .select {
    list-style: none;
    display: flex;
    justify-content: center;

    li {
      padding: 0 12px;
      font-weight: lighter;
      cursor: pointer;
    }

    .active {
      border-radius: 15px;
      background-color: #31c27c;
      font-weight: 500;
    }
  }

  .main-singer {
    width: 100%;
    height: 400px;
    display: grid;
    grid-template-columns: 200px 200px 200px 200px;
    grid-column-gap: 20px;
    justify-content: center;
    align-items: center;

    div {
      display: flex;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      flex-wrap: wrap;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: pink;
        cursor: pointer;
      }

      p {
        margin-top: 10px;
        cursor: pointer;
      }
    }
  }

  .example-pagination-block {
    --el-color-primary: #31c27c;
    display: flex;
    flex-direction: column;
    width: 1200px;

    .example-demonstration {
      margin: 10px 5px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;

      .outbox {
        position: relative;
        width: 1fr;
        margin-top: 20px;
        display: flex;
        align-items: center;

        img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #31c27c;
          cursor: pointer;
        }

        p {
          position: absolute;
          left: 60px;
          cursor: pointer;
        }
      }
    }

    .el-pagination {
      justify-content: center;
    }
  }
}
</style>
