<script setup>
import { ref, watch } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import Button from './components/Button.vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/api/user'
import { useUserStore } from '@/stores'

const isLoginShow = ref(true)
const formRef = ref()
const form = ref({
  username: '',
  password: '',
  repassword: ''
})
const router = useRouter()
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 10, message: '用户名必须是 3到10 的字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6到15位 的非空字符',
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是 6到15位 的非空字符',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        // 判断 value 和 当前 form 中收集的 password 是否一致
        if (value !== form.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback() // 就算校验成功也需要callback回调
        }
      },
      trigger: 'blur'
    }
  ]
}
const change = (val) => {
  form.value.repassword = val
}

// 登录
const userStore = useUserStore()
userStore.removeToken()
userStore.setUser({})
userStore.setLikeSongsId([])
userStore.setCreatedPlaylist([])
const Login = async () => {
  try {
    await formRef.value.validate()
    const res = await loginUser(form.value)
    if (res.data.status === 200) {
      router.push('/music')
      ElMessage.success('登录成功')
      // 获取用户信息存入 store
      userStore.setToken(res.data.data.token)
      await userStore.getUser()
      userStore.toggleState()
    } else if (res.data.status === 401) {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    if (error.isFormValidationError) {
      ElMessage.error('表单校验未通过，登录失败')
    } else {
      // 其他错误处理
    }
  }
}

// 注册
const Register = async () => {
  await formRef.value.validate()
  // ElMessage.success('注册成功')
  ElMessage.warning('暂未开放注册功能，请联系管理员获取账密')
  isLoginShow.value = !isLoginShow.value
}

// 忘记密码
const forgot = () => {
  ElMessage.warning('忘记密码请联系管理员')
}

watch(isLoginShow, () => {
  formRef.value.resetFields()
})
</script>

<template>
  <div class="container">
    <div class="big">
      <el-form
        :model="form"
        class="left"
        v-show="isLoginShow"
        :rules="rules"
        ref="formRef"
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :prefix-icon="User"
            placeholder="账号"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            @input="change"
            v-model="form.password"
            :prefix-icon="Lock"
            placeholder="密码"
            type="password"
          />
        </el-form-item>
        <el-form-item>
          <RouterLink to="#" @click="forgot">忘记密码？</RouterLink>
        </el-form-item>
        <el-form-item>
          <Button @click="Login">
            <template #title>登 录</template>
          </Button>
        </el-form-item>
      </el-form>
      <div class="leftToggle" v-show="!isLoginShow">
        <Button @click="isLoginShow = !isLoginShow">
          <template #title>登 录</template>
        </Button>
      </div>
      <div class="rightToggle" v-show="isLoginShow">
        <Button @click="isLoginShow = !isLoginShow">
          <template #title>注 册</template>
        </Button>
      </div>
      <el-form
        :model="form"
        class="right"
        v-show="!isLoginShow"
        :rules="rules"
        ref="formRef"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            :prefix-icon="User"
            placeholder="账号"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            :prefix-icon="Lock"
            placeholder="密码"
            type="password"
          />
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="form.repassword"
            :prefix-icon="Lock"
            placeholder="再次输入密码"
            type="password"
          />
        </el-form-item>
        <el-form-item>
          <Button @click="Register">
            <template #title>注 册</template>
          </Button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  background-image: url('@/assets/cont/LoginBackground.jpg');
  background-size: 100% 100%;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  .big {
    width: 50vw;
    height: 50vh;
    background-color: transparent;
    box-shadow: 0 2px 20px 2px rgb(3, 13, 14);
    border-radius: 20px;
    overflow: hidden;

    display: flex;

    .left,
    .right {
      width: 25vw;
      height: 50vh;
      background-color: rgb(233, 233, 233);

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      h1 {
        margin-bottom: 3vh;
        color: rgb(6, 6, 6);
        font-weight: lighter;
      }

      a {
        text-decoration: none;

        &:link,
        &:visited {
          color: rgb(62, 158, 222);
        }

        &:active,
        &:hover {
          color: red;
        }
      }
    }

    .leftToggle,
    .rightToggle {
      width: 25vw;
      height: 50vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
