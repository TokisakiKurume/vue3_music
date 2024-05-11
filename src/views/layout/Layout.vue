<script setup>
import { ref, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SearchBorder from '@/views/layout/components/SearchBorder.vue'
import {
  User,
  Crop,
  EditPen,
  SwitchButton,
  Plus,
  Upload
} from '@element-plus/icons-vue'
import { updateAvatar, updateUserPassword, updateUserInfo } from '@/api/user'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const isLogin = ref(userStore.token)

// 路径高亮
const activeIndex = ref(router.currentRoute.value.path)
activeIndex.value = '/' + activeIndex.value.split('/')[1]
// 重定向到首页
const redirectToRoot = async () => {
  await router.push('/')
  window.location.reload()
}
const jumpToVip = () => {
  if (isLogin.value) return '/VIP'
  else {
    ElMessage.error('请先登录')
    return '/login'
  }
}
// 路径高亮显示检测
watch(
  () => route.fullPath, // 监听网址变化
  (newPath) => {
    activeIndex.value = '/' + newPath.split('/')[1]
  }
)

// 抽屉
const drawer_profile = ref(false)
const drawer_avatar = ref(false)
const drawer_password = ref(false)
// 头像下拉菜单功能
const handleCommand = (key) => {
  switch (key) {
    case 'profile':
      drawer_profile.value = !drawer_profile.value
      break
    case 'avatar':
      drawer_avatar.value = !drawer_avatar.value
      break
    case 'password':
      drawer_password.value = !drawer_password.value
      break
    case 'logout':
      ElMessageBox.confirm('是否退出当前账号', '警告', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then((action) => {
          if (action === 'confirm') {
            router.push('/login')
          }
        })
        .catch(() => {
          // 取消按钮被点击时的回调
        })
      break
    case 'login':
      router.push('/login')
      break
  }
}

// 基本资料
const formRefProfile = ref()
const username = ref(userStore.user.user_name)
const nickname = ref(userStore.user.user_nick)
const email = ref(userStore.user.user_email)
const form = ref({
  username: username.value,
  nickname: nickname.value,
  email: email.value
})
const rules_profile = {
  nickname: [
    { required: true, message: '昵称不能为空', trigger: 'blur' },
    {
      pattern: /^\S{2,10}$/,
      message: '昵称长度需在2-10位之间',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}
const confirmClick = async () => {
  await formRefProfile.value.validate()
  await updateUserInfo(form.value)
  await userStore.getUser()
  ElMessage.success('修改成功')
}

// 更换头像
const uploadRef = ref()
const imgUrl = ref('https://picsum.photos/200/200')
// 登录进入后头像没更新
setTimeout(() => {
  if (userStore.token) {
    imgUrl.value = userStore.user.user_picSrc + `?random=${Math.random()}`
  }
}, 100)

const file = ref()
const upload = () => {
  uploadRef.value.$el.querySelector('input').click()
}
const onSelectFile = (uploadFile) => {
  //基于 FileReader 读取图片做预览
  const reader = new FileReader()
  const fileDate = new FormData()
  fileDate.append('image', uploadFile.raw)
  reader.readAsDataURL(uploadFile.raw)
  reader.onload = () => {
    imgUrl.value = reader.result
  }
  file.value = fileDate
}
const onUpdateAvatar = async () => {
  if (imgUrl.value === 'https://picsum.photos/200/200')
    return ElMessage.error('无法上传初始随机图片')
  else if (imgUrl.value.includes('http'))
    return ElMessage.error('请更换为本地图片后上传')
  // 发送请求更新头像
  await updateAvatar(file.value)
  // userStore直接渲染
  await userStore.getUser()
  userStore.toggleState()
  // 使用 nextTick 确保提示框在 Vue 渲染之后弹出
  nextTick(() => {
    ElMessage.success('头像更新成功')
  })
}
// watch(
//   () => userStore.state,
//   () => {
//     imgUrl.value = userStore.user.user_picSrc
//   }
// )

// 修改密码
const formRefPassword = ref()
const pwdForm = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
})
const validateNewPassword = (rule, value, callback) => {
  if (value === pwdForm.value.old_pwd) {
    callback(new Error('新密码不能与原密码相同'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== pwdForm.value.new_pwd) {
    callback(new Error('确认密码必须与新密码相同'))
  } else {
    callback()
  }
}

const rulesPassword = {
  old_pwd: [
    { required: true, message: '原密码不能为空', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度需在6-15位之间', trigger: 'blur' }
  ],
  new_pwd: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度需在6-15位之间', trigger: 'blur' },
    { validator: validateNewPassword, trigger: 'blur' }
  ],
  re_pwd: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { min: 6, max: 15, message: '密码长度需在6-15位之间', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const updatePassword = async () => {
  await formRefPassword.value.validate()
  const res = await updateUserPassword(pwdForm.value)
  if (res.data.status === 401) {
    ElMessage.error(res.data.message)
    return
  }
  ElMessage.success('密码修改成功')

  // 拦截到登录页
  router.push('/login')
  resetForm()
}

const resetForm = () => {
  pwdForm.value.old_pwd = ''
  pwdForm.value.new_pwd = ''
  pwdForm.value.re_pwd = ''
}
</script>

<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu"
    mode="horizontal"
    :ellipsis="false"
    router
  >
    <div class="logo" @click="redirectToRoot"></div>
    <div class="flex-grow" />
    <el-menu-item index="/music" style="font-size: var(--fontSize)"
      >音乐馆</el-menu-item
    >
    <el-menu-item index="/mymusic" style="font-size: var(--fontSize)"
      >我的音乐</el-menu-item
    >
    <el-menu-item style="font-size: var(--fontSize)">
      <RouterLink
        @click="jumpToVip"
        :target="isLogin ? '_blank' : ' '"
        :to="isLogin ? '/VIP' : '/login'"
      >
        VIP
      </RouterLink>
    </el-menu-item>
    <div>
      <SearchBorder></SearchBorder>
    </div>

    <p class="p" v-if="!isLogin">未登录</p>
    <p class="p" v-if="isLogin">
      欢迎使用，{{ userStore.user.user_nick || userStore.user.user_name }}
    </p>
    <el-dropdown @command="handleCommand">
      <el-avatar
        :size="50"
        :class="['avatar', isLogin ? 'active' : '']"
        :src="imgUrl"
      />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="profile" :icon="User" v-if="isLogin"
            >基本资料</el-dropdown-item
          >
          <el-dropdown-item command="avatar" :icon="Crop" v-if="isLogin"
            >更换头像</el-dropdown-item
          >
          <el-dropdown-item command="password" :icon="EditPen" v-if="isLogin"
            >重置密码</el-dropdown-item
          >
          <el-dropdown-item command="logout" :icon="SwitchButton" v-if="isLogin"
            >退出登录</el-dropdown-item
          >
          <el-dropdown-item command="login" :icon="SwitchButton" v-if="!isLogin"
            >未登录</el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
  <el-drawer v-model="drawer_profile" direction="rtl">
    <template #header>
      <h4>基本资料</h4>
    </template>
    <template #default>
      <el-form
        :model="form"
        :rules="rules_profile"
        ref="formRefProfile"
        label-width="120px"
      >
        <el-form-item label="登录名称">
          <el-input v-model="form.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="form.nickname"></el-input>
        </el-form-item>
        <el-form-item label="用户邮箱" prop="email">
          <el-input v-model="form.email"></el-input>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="confirmClick('profile')" class="btn"
          >提交修改</el-button
        >
        <el-button @click="handleCommand('profile')" class="btn"
          >取消</el-button
        >
      </div>
    </template>
  </el-drawer>
  <el-drawer v-model="drawer_avatar" direction="rtl">
    <template #header>
      <h4>更换头像</h4>
    </template>
    <template #default>
      <div>
        <el-upload
          ref="uploadRef"
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="onSelectFile"
        >
          <el-avatar
            v-if="imgUrl"
            shape="square"
            :src="imgUrl"
            class="avatar"
            :size="300"
          />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <p></p>
        <el-button class="btn" :icon="Plus" size="large" @click="upload"
          >选择图片</el-button
        >
        <el-button
          @click="onUpdateAvatar"
          class="btn"
          :icon="Upload"
          size="large"
          >上传头像</el-button
        >
      </div>
    </template>
  </el-drawer>
  <el-drawer v-model="drawer_password" direction="rtl">
    <template #header>
      <h4>重置密码</h4>
    </template>
    <template #default>
      <div>
        <el-form
          ref="formRefPassword"
          :model="pwdForm"
          :rules="rulesPassword"
          label-width="120px"
        >
          <el-form-item label="原密码" prop="old_pwd">
            <el-input v-model="pwdForm.old_pwd" type="password"></el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="new_pwd">
            <el-input v-model="pwdForm.new_pwd" type="password"></el-input>
          </el-form-item>
          <el-form-item label="确认新密码" prop="re_pwd">
            <el-input v-model="pwdForm.re_pwd" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button class="btn" @click="updatePassword">修改密码</el-button>
            <el-button @click="resetForm" class="btn">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </template>
  </el-drawer>
  <RouterView></RouterView>
</template>

<style lang="scss" scoped>
.flex-grow {
  flex-grow: 1;
}

.el-menu {
  --fontSize: 1.3em;
  --el-menu-active-color: rgb(49, 194, 124);
  --el-menu-hover-text-color: rgb(49, 194, 124);
  --el-color-primary: #31c27c;
  height: 90px;
  width: 1250px;
  margin: auto;
  align-items: center;

  a {
    text-decoration: none;
  }

  .p {
    color: gray;
    cursor: default;
    margin-left: 10px;
  }

  .logo {
    background-image: url('@/assets/cont/Logo.jpg');
    background-size: 100% 100%;
    width: 140px;
    height: 90px;
    cursor: pointer;
  }

  .avatar {
    margin: 0 20px;
    cursor: pointer;
    outline: none;
  }

  .active {
    background-color: rgb(49, 194, 124);
  }
}
</style>

<style lang="scss">
.el-button--primary {
  --el-color-primary: #31c27c;
  --el-color-primary-dark-2: #31c27c;
}
.el-button {
  --el-button-outline-color: transparent;
}
.el-dropdown-menu {
  --el-dropdown-menuItem-hover-color: #31c27c;
}
.el-button:hover {
  --el-button-hover-bg-color: #07a056;
  --el-button-hover-border-color: #31c27c;
  --el-button-hover-text-color: white;
}
.btn {
  --el-fill-color-blank: #31c27c;
  color: white;

  &:hover {
    background-color: #07a056;
  }
}
</style>
