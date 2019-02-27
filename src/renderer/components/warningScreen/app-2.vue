//子组件通过props方法接受数据
<template>
    <section>
        <p style="color: #321c67">
            <span>shop.rating</span>
            <em>月售shop.recent_order_num单</em>
        </p>
        <div style="color: #ff6666" @click="emitEvent()">阿萨斯多啊</div>
    </section>
</template>

<script>
    export default {
        name: "app-2",
        methods: {
            emitEvent() {
                debugger;
                this.$emit('suntofather', '我是2子传父的参数')   // 派发函数，并传递值，params是你自己想传的值
            }
        }
    }
</script>

<style scoped>

</style>