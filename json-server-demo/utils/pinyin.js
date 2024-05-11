import { pinyin } from 'pinyin-pro'

// 将汉字转换为拼音
const hanzi = (hanzi) => {
  const pinyinArray = pinyin(hanzi, {
    toneType: 'none',
    type: 'array'
  })
  return pinyinArray.join('').toLowerCase()
}
export default hanzi
