<style scoped lang="less">
    @import "MainScreen";
</style>
<template>
    <div class="layout">
        <Layout>
            <Header class="header-layout" :style="{position: 'fixed', width: '100%'}">
                <Row>
                    <Col span="3" class="layout-logo">
                        <Icon custom="i-icon icon-appicon" size="55"></Icon>
                    </Col>
                    <Col span="15" class="layout-nav">
                        <Menu mode="horizontal" theme="dark" active-name="1" @on-select="onClickForTab">
                            <MenuItem name="indicator">
                                <Icon custom="i-icon icon-hardwareview" size="45"></Icon>
                                指标视图
                            </MenuItem>
                            <MenuItem name="warning">
                                <Icon custom="i-icon icon-warningview" size="45"></Icon>
                                告警视图
                            </MenuItem>
                            <MenuItem name="maintenance">
                                <Icon custom="i-icon icon-maintain-report" size="45"></Icon>
                                运维报表
                            </MenuItem>
                            <MenuItem name="treeview">
                                <Icon type="ios-star-outline" size="45"></Icon>
                                收藏夹
                            </MenuItem>
                        </Menu>
                    </Col>
                    <Col span="6" class="layout-nav-right">
                        <Menu mode="horizontal" theme="dark" @on-select="onClickForWindwoContral">
                            <MenuItem name="setting">
                                <Icon type="md-settings"/>
                            </MenuItem>
                            <MenuItem name="minWindow">
                                <Icon type="md-remove"/>
                            </MenuItem>
                            <MenuItem name="maxWindow">
                                <Icon type="ios-square-outline"/>
                            </MenuItem>
                            <MenuItem name="closeWindow">
                                <Icon type="md-close"/>
                            </MenuItem>
                        </Menu>
                    </Col>
                </Row>
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
            },
            onClickForTab(name) {
                console.log('name:' + name);
                this.$router.push({
                    name: name
                });
            },
            onClickForWindwoContral(event) {
                console.log('event:' + event);
            }
        }
    };
</script>
