<template>
    <div>
        <h2 style="background: orange">app视图</h2>
        <Button type="primary" @click="onClickForLogin">获取APP列表</Button>
    </div>
</template>
<script>
    import dataListener from 'dirManagers/dataListener';

    export default {
        created: function () {
            console.log('AppView初始化');
        },
        destroyed: function () {
            console.log('AppView销毁');
        },
        methods: {
            onClickForLogin() {
                dataListener.methods.getAppList();
            }
        }
    };
</script>