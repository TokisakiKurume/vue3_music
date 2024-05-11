import { queryUserLikeSheetById } from './api/mysql.js'

/* 自动填写歌手拼音 */
// for (let i = 0; i <= 43; i++) {
//   querySingerById(i)
// }
// querySingerById(44)

const demo = async () => {
  const res = await queryUserLikeSheetById(1)
    .then((result) => {
      console.log('res:', result)
    })
    .catch((err) => {
      console.log('err:', err.message)
    })
  console.log(res)
}
demo()
