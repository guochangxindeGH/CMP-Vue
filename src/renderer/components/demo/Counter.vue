<template>
    <div>
        <h3>Counter.vue</h3>
        {{ count }}
        <button @click="increment">自增</button>
        <button @click="incrementByAsync">异步自增</button>

    </div>
</template>

<script>
    export default {
        name: "Counter",
        data () {
            return {
                count: 0
            }
        },

        methods: {
            increment () {
                this.count++
            },
            incrementByAsync () {
                window.setTimeout(() => {
                    this.count++;
                }, 1000)
            }
        }
    }
</script>

<style scoped>

</style>