<script setup>
import { reactive, ref, watch, nextTick, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import {
  musicGetLabels,
  addSheet,
  editSheetByUser,
  updateSheetInfo
} from '@/api/sheet'

const router = useRouter()
const route = useRoute()

// 表单信息
const ruleForm = reactive({
  name: '',
  label: [],
  labelId: [],
  picSrc: '',
  sheet_id: route.params.id,
  privacy: true
})
const labelShow = ref(ruleForm.label.join('  ')) // 标签展示框内容
const imageUrl = ref('')
const labelRef = ref('')
// 歌单ID
const id = route.params.id
// 检测用户是否有权限访问该歌单
const isEditable = async () => {
  if (id) {
    const res = await editSheetByUser(id).catch(() => {
      router.replace('/mymusic/like/song')
    })
    if (res.data.status === 200) {
      ruleForm.name = res.data.data.sheet_name
      ruleForm.privacy = res.data.data.sheet_visible === 0 ? false : true
      if (res.data.data.labelId)
        ruleForm.labelId = res.data.data.labelId.map(
          (item) => item.labelItem_id
        )
      imageUrl.value = res.data.data.sheet_picSrc
      labelShow.value = ruleForm.label.join('  ')
      ruleForm.picSrc = imageUrl.value // 确保可以通过校验
    }

    nextTick(() => {
      // labelRef.value.clientHeight
      // console.log(labelRef.value.clientHeight)
      // let active = labelRef.value.querySelectorAll('.active')
      // ruleForm.label = Array.from(active).map((element) => element.textContent)
      // console.log(labelRef.value)
      // console.log(active)
    })

    setTimeout(() => {
      let active = document.querySelectorAll('.title-son.active')
      ruleForm.label = Array.from(active).map((element) => element.textContent)
      // console.log(active)
    }, 50)
  }
}
isEditable()
onMounted(() => {
  // let active = document.querySelectorAll('.title-son.active')
  // ruleForm.label = Array.from(active).map((element) => element.textContent)
  // console.log(active)
})

// 表单模块
const ruleFormRef = ref()
const uploadRef = ref()

let formData = new FormData() // 传给后端的数据
const rules = {
  name: [
    { required: true, message: '请填写歌单名称', trigger: 'blur' },
    { min: 3, max: 15, message: '歌单名称长度为3到15个字符', trigger: 'blur' }
  ],
  picSrc: [
    { required: true, message: '请上传歌单封面', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (imageUrl.value) {
          callback() // 图片存在，验证通过
        } else {
          callback(new Error('请上传歌单封面')) // 图片不存在，验证失败
        }
      },
      trigger: 'blur'
    }
  ]
}
const privacyChange = () => {
  console.log(ruleForm.privacy)
}
// 提交按钮
const submitForm = async (formEl) => {
  await formEl.validate()
  if (!id) {
    const res = await addSheet(formData)
    ElMessage.success(res.data.message)
    router.replace('/mymusic/create')
  } else {
    const res = await updateSheetInfo(formData)
    ElMessage.success(res.data.message)
    router.replace('/mymusic/create')
  }
}
// 取消按钮
const cancel = () => {
  router.replace('/mymusic/create')
}

// 图片上传模块
const onSelectFile = (uploadFile) => {
  //基于 FileReader 读取图片做预览
  const reader = new FileReader()
  formData.delete('image')
  formData.append('image', uploadFile.raw)
  reader.readAsDataURL(uploadFile.raw)
  reader.onload = () => {
    imageUrl.value = reader.result
    ruleForm.picSrc = imageUrl.value // 确保可以通过校验
  }
}

// 标签选择
const labelSelect = (e) => {
  // 如果点的其他位置直接结束
  if (!e.target.classList.contains('title-son')) return

  let active = document.querySelectorAll('.title-son.active')
  if (e.target.classList.contains('active')) {
    // 如果点击已选择的则取消选择
    e.target.classList.remove('active')
    ruleForm.label = ruleForm.label.filter(
      (item) => item !== e.target.textContent
    )
    ruleForm.labelId = ruleForm.labelId.filter(
      (item) => item !== +e.target.dataset.id
    )
  } else if (active.length < 3) {
    // 如果选择未超过3个则加入标签
    e.target.classList.add('active')
    ruleForm.label.push(e.target.textContent)
    ruleForm.labelId.push(+e.target.dataset.id)
  } else {
    // 如果选择超过三个
    ElMessage.error('最多支持三个标签')
  }
}
// 歌单分类标签
const labelsData = ref({ title: '', son_title: ['son_title1', 'son_title2'] })
const getLabelData = async () => {
  const res = await musicGetLabels()
  const sortedLabelsData = res.data.data.sort((a, b) => {
    return a.id - b.id // 根据 id 进行升序排序
  })
  labelsData.value = sortedLabelsData
}
getLabelData()

// 监听 ruleFrom 变化给 fileDate 赋值
watch([ruleForm, imageUrl], () => {
  // 清空 formData 中的相关属性
  formData.delete('sheet_id')
  formData.delete('name')
  formData.delete('privacy')
  formData.delete('label')
  formData.delete('labelId')
  // 重新赋值
  formData.append('sheet_id', ruleForm.sheet_id)
  formData.append('name', ruleForm.name)
  formData.append('privacy', ruleForm.privacy)
  formData.append('label', ruleForm.label)
  formData.append('labelId', ruleForm.labelId)
  labelShow.value = ruleForm.label.join('  ')
})
</script>

<template>
  <div class="container">
    <div class="common-layout">
      <el-container>
        <el-header style="font-size: 20px">{{
          id ? '编辑歌单' : '创建歌单'
        }}</el-header>
        <el-main>
          <el-form
            ref="ruleFormRef"
            style="max-width: 600px"
            :model="ruleForm"
            status-icon
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
          >
            <el-form-item label="歌单名称" prop="name">
              <el-input
                v-model="ruleForm.name"
                type="text"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item label="歌单封面" prop="picSrc">
              <el-upload
                class="avatar-uploader"
                :show-file-list="false"
                :on-change="onSelectFile"
                :auto-upload="false"
                ref="uploadRef"
              >
                <el-avatar
                  shape="square"
                  v-if="imageUrl"
                  :src="imageUrl"
                  class="avatar"
                  prop="picSrc"
                />
                <el-icon v-else class="avatar-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <p style="margin: 0 20px; color: gray; font-size: 14px">
                上传仅支持照片格式<br />图片大小2MB以内
              </p>
            </el-form-item>
            <el-form-item label="歌单标签" prop="lable">
              <el-input
                v-model="labelShow"
                type="text"
                autocomplete="off"
                disabled
              />
              <p style="color: gray">最多选择三个标签</p>
              <div class="lable" @click="labelSelect" ref="labelRef">
                <div
                  class="content"
                  v-for="(item, index) in labelsData"
                  :key="index"
                >
                  <div class="title">{{ item.title }}</div>
                  <span
                    :class="[
                      'title-son',
                      ruleForm.labelId.includes(item_son.labelItem_id)
                        ? 'active'
                        : ''
                    ]"
                    v-for="item_son in item.son_title"
                    :key="item_son.labelItem_id"
                    :data-id="item_son.labelItem_id"
                    >{{ item_son.labelItem_name }}</span
                  >
                </div>
              </div>
            </el-form-item>
            <el-form-item label="歌单隐私" prop="privacy">
              <el-radio-group
                v-model="ruleForm.privacy"
                @change="privacyChange"
              >
                <el-radio :value="true" :label="true">所有人可见</el-radio>
                <el-radio :value="false" :label="false">仅自己可见</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item style="margin: 0 80px">
              <el-button
                type="primary"
                @click="submitForm(ruleFormRef)"
                style="width: 100px"
                >提交</el-button
              >
              <el-button @click="cancel" style="width: 100px">取消</el-button>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  .common-layout {
    --el-color-primary: #31c27c;
    --el-color-primary-light-3: #2caf6f;
    --el-color-primary-light-9: transparent;
    width: 1200px;
    margin: auto;
    background-color: #fafafa;
    padding-top: 30px;
    overflow: hidden;

    .avatar-uploader .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .lable {
      overflow: auto;
      width: 600px;
      height: 300px;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #e1e1e1;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 5px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background-color: #b2b2b2;
      }

      .content {
        .title {
          color: gray;
        }

        .title-son {
          display: inline-block;
          margin: 2px 0;
          width: 16%;
          cursor: pointer;

          &:hover {
            color: #31c27c;
          }

          &.active {
            color: #31c27c;
          }
        }
      }
    }
  }
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
