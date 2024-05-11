<script setup>
import { ref } from 'vue'

const boxShow = ref(false)
const toggleBoxShow = () => {
  boxShow.value = !boxShow.value
}
</script>

<template>
  <div class="container">
    <img src="@/assets/cont/banner_thumb_1.webp" alt="" class="img" />
    <div class="content">
      <h1>豪华VIP 选择率真的很高</h1>
      <p>音乐，真的很好听</p>
      <el-button @click="toggleBoxShow">立即充值</el-button>
    </div>
    <div class="mask" v-show="boxShow">
      <div class="box">
        <p>本项目仅供学习使用，暂不支持VIP充值哟~</p>
        <div class="close" title="关闭" @click="toggleBoxShow">x</div>
        <img src="@/assets/cont/happy.webp" alt="" /><br />
        <div class="button" @click="toggleBoxShow">确定</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  position: relative;
  width: 100%;

  .img {
    position: absolute;
    z-index: -1;
    width: 100%;
    height: 100%;
  }

  .content {
    width: 100%;
    height: 110vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: white;
    user-select: noen;

    h1 {
      font-size: 64px;
      margin-bottom: 10px;
    }

    p {
      font-size: 20px;
      margin-bottom: 30px;
    }

    button {
      font-size: 24px;
      padding: 20px 25px;
      border-radius: 24px;
      transform: scale(1.5);
      color: white;
      background-color: #31c27c;
      border: transparent;
      cursor: pointer;

      &:hover {
        background-color: #2caf6f;
      }
    }
  }

  .mask {
    position: absolute;
    top: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: rgba($color: #000, $alpha: 0.5);
    display: flex;
    justify-content: center;
    align-items: center;

    .box {
      position: relative;
      padding: 20px 0;
      width: 50%;
      height: 400px;
      background-color: white;
      text-align: center;

      p {
        font-size: 24px;
        font-weight: bolder;
      }

      .close {
        position: absolute;
        top: 0;
        right: 8px;
        cursor: pointer;

        &:hover {
          color: #31c27c;
        }
      }

      .button {
        display: inline-block;
        padding: 5px 15px;
        border-radius: 15px;
        background-color: #31c27c;
        color: white;
        cursor: pointer;

        &:hover {
          background-color: #2caf6f;
        }
      }
    }
  }
}
</style>
