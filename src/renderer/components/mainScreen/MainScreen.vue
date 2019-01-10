<template>
    <!--这是主界面-->
    <div>
        main
        <h1 style="color: black">bbbb</h1>
    </div>
</template>

<style scoped lang="less">
</style>

<script>
    import {ipcRenderer} from 'electron';

    export default {
        name: 'login-page',
        data() {
            return {};
        },
        created: function () {
            console.log('主界面初始化');
            ipcRenderer.on('dataChange', this.onDataChanged);
        },
        methods: {
            onDataChanged(event, msg) {
                let packName = msg.packName;
            }
        }
    };
</script>
