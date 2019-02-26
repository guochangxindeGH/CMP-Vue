//子组件通过props方法接受数据
<template>
    <section>
        <p style="color: #321c67">
            <span>shop.rating{{title}}</span>
            <em>月售shop.recent_order_num单{{cont}}</em>
        </p>
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
    }
</script>

<style scoped>

</style>