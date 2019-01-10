<template>
    <!--这是主界面-->
    <div>
        main
        <h1 style="color: black">bbbb</h1>
        <Button type="primary" @click="logout">注销</Button>
    </div>
</template>

<style scoped lang="less">
</style>

<script>
    import {ipcRenderer} from 'electron';

    export default {
        name: 'main-page',
        data() {
            return {};
        },
        created: function () {
            console.log('主界面初始化');
            ipcRenderer.send('resizeMainWindowSizeMsg', false);
            ipcRenderer.on('dataChange', this.onDataChanged);
        },
        methods: {
            onDataChanged(event, msg) {
                let packName = msg.packName;
            },
            logout() {
                this.$router.push({
                    name: 'login-page'
                });
            }
        }
    };
</script>
