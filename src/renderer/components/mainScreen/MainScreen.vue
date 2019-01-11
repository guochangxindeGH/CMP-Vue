<style scoped lang="less">
    @import "MainScreen";
</style>
<template>
    <div class="layout">
        <Layout>
            <Header class="header-layout" :style="{position: 'fixed', width: '100%'}">
                <Menu mode="horizontal" theme="dark" active-name="1" @on-select="choosedMenu">
                    <div class="layout-logo">
                        <Icon custom="i-icon icon-appicon" size="55"></Icon>
                    </div>
                    <div class="layout-nav">
                        <MenuItem name="1">
                            <Icon custom="i-icon icon-hardwareview" size="45"></Icon>
                            指标视图
                        </MenuItem>
                        <MenuItem name="2">
                            <Icon custom="i-icon icon-warningview" size="45"></Icon>
                            告警视图
                        </MenuItem>
                        <MenuItem name="3">
                            <Icon custom="i-icon icon-maintain-report" size="45"></Icon>
                            运维报表
                        </MenuItem>
                        <MenuItem name="4">
                            <Icon type="ios-star-outline" size="45"></Icon>
                            收藏夹
                        </MenuItem>
                    </div>
                    <div class="layout-nav-right">
                        <MenuItem name="1">
                            <Icon type="md-settings"/>
                        </MenuItem>
                        <MenuItem name="2">
                            <Icon type="md-remove"/>
                        </MenuItem>
                        <MenuItem name="3">
                            <Icon type="ios-analytics" size="15"></Icon>
                        </MenuItem>
                        <MenuItem name="4">
                            <Icon type="md-close"/>
                        </MenuItem>
                    </div>
                </Menu>
            </Header>
            <Content class="content-layout">
                <!-- 路由匹配到的组件将渲染在这里 -->
                <router-view></router-view>
            </Content>
        </Layout>
    </div>
</template>

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
            choosedMenu(name) {
                if (name === '1') {
                    this.$router.push({
                        name: 'appView'
                    });
                } else {
                    this.$router.push({
                        name: 'hardwareView'
                    });
                }
            }
        }
    };
</script>
