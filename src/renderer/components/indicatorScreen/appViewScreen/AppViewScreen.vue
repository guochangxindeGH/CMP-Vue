<template>
    <div>
        <h2 style="background: orange">app视图</h2>
        <Button type="primary" @click="onClickForLogin">获取APP列表</Button>
    </div>
</template>
<script>
    import * as dataManager from 'dirManagers/dataManager';

    export default {
        created: function () {
            console.log('AppView初始化');
            dataManager.initDataManager();
        },
        destroyed: function () {
            console.log('AppView销毁');
        },
        data() {
            return {
                test: 1
            };
        },
        methods: {
            onClickForLogin() {
                console.log('appview mAppList:' + this.mAppList);
                // console.log('test:' + this.test);
                // console.log('appview .mAppList:' + this.mAppList);
                dataManager.getAppList();
            }
        }
    };
</script>