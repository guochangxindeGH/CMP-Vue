<style scoped lang="less">
    @import "MainScreen";
</style>
<template>
    <div class="layout">
        <Layout>
            <Header :style="{position: 'fixed', width: '100%'}">
                <Menu mode="horizontal" theme="dark" active-name="1">
                    <div class="layout-logo"></div>
                    <div class="layout-nav">
                        <MenuItem name="1">
                            <Icon type="ios-navigate" size="45"></Icon>
                            指标视图
                        </MenuItem>
                        <MenuItem name="2">
                            <Icon type="ios-keypad" size="45"></Icon>
                            告警视图
                        </MenuItem>
                        <MenuItem name="3">
                            <Icon type="ios-analytics" size="45"></Icon>
                            运维报表
                        </MenuItem>
                        <MenuItem name="4">
                            <Icon type="ios-paper" size="45"></Icon>
                            收藏夹
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Content :style="{margin: '0px 0px 0', background: '#fff', minHeight: '100%'}">
                Content
            </Content>
        </Layout>
    </div>
</template>

<script>
    import {ipcRenderer} from 'electron';

    export default {
        name: 'login-page',
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
            }
        }
    };
</script>
