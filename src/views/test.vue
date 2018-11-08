<template>
  <div class="test">
    Just a test page.
    <div>
      <router-link to="/">Homs</router-link>
    </div>
    <div><h2></h2></div>
    <div><span>{{count}}</span></div>
    <div><button @click="count++">+1</button></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //mode: process.env.VUE_ENV == 'server' ? 'server' : 'client',
      count: 1231231231
    }
  }
}
</script>
