<script setup>
const stop = (e) => {
  e.preventDefault()
}
</script>

<template>
  <button @click="stop">
    <slot name="title"></slot>
  </button>
</template>

<style lang="scss" scoped>
button {
  text-align: center;
  background: linear-gradient(to right, rgb(3, 86, 137), rgb(2, 159, 177));
  width: 8vw;
  height: 5vh;
  border-radius: 30px;
  border: transparent;
  color: white;
  font-weight: 550;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}
</style>
