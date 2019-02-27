//子组件通过props方法接受数据
<template>
    <section>
        <p style="color: #321c67">
            <span>shop.rating{{title}}</span>
            <em>月售shop.recent_order_num单{{cont}}</em>
        </p>
        <div style="color: #ff6666" @click="emitEvent()">{{title}}</div>
    </section>
</template>

<script>
    export default {
        name: "app-1",
        //接受父组件传值
        props:  {
            title: {
                type:Number,
                required:true
            },
            cont: {
                type:String,
                required:true
            }
        },
        methods: {
            emitEvent() {
                debugger;
                this.$emit('suntofather', '我是1子传父的参数')   // 派发函数，并传递值，params是你自己想传的值
            }
        }
    }
</script>

<style scoped>

</style>