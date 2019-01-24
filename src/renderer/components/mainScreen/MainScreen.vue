<style scoped lang="less">
    @import "MainScreen";
</style>
<template>
    <div class="mainScreenLayout">
        <Layout>
            <Header class="header-layout" :style="{position: 'fixed', width: '100%'}">
                <Row>
                    <Col span="3" class="layout-logo">
                        <Icon custom="i-icon icon-appicon" size="55"></Icon>
                    </Col>
                    <Col span="15" class="layout-nav">
                        <Menu mode="horizontal" theme="dark" active-name="indicator" @on-select="onClickForTab">
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
            <div class="resizeHeader">
                <div class="left-drag"></div>
                <div class="right-drag"></div>
            </div>
            <Content class="content-layout">
                <!-- 路由匹配到的组件将渲染在这里 -->
                <router-view></router-view>
            </Content>
        </Layout>
    </div>
</template>

<script>
    import {ipcRenderer} from 'electron';
    import Utils from 'dirUtil/Utils';
    import * as dataManager from 'dirManagers/dataManager';
    import {getWarningWithParam} from 'dirManagers/warningManager';

    export default {
        name: 'login-page',
        // mixins: [dataListener],
        data() {
            return {};
        },
        created: function () {
            console.log('主界面初始化');
            ipcRenderer.send('resizeMainWindowSizeMsg', {
                    isLoginScreen: false,
                    enableResize: true,
                    maxWindow: true,
                    minWindow: false,
                    quiteApp: false
                }
            );
            ipcRenderer.on('dataChange', this.onDataChanged);
            dataManager.initDataManager();
        },
        destroyed: function () {
            console.log('主界面销毁');
            ipcRenderer.removeListener('dataChange', this.onDataChanged);
        },
        methods: {
            onDataChanged(event, msg) {
                console.log('data');
            },
            onClickForTab(name) {
                let warningList = getWarningWithParam('N', 99, '', '', 'MainTip');
                console.log('warningList:' + warningList);
                /**
                 *
                 console.log('name:' + name);
                 this.$router.push({
                    name: name
                });
                 */
            },
            onClickForWindwoContral(event) {
                if (event === 'setting') {
                    // 临时注销
                    this.logout();
                    return;
                }
                let windowOpt = {
                    isLoginScreen: false,
                    enableResize: true,
                    maxWindow: false,
                    minWindow: false,
                    quiteApp: false
                };

                if (event === 'minWindow') {
                    windowOpt.minWindow = true;
                } else if (event === 'maxWindow') {
                    windowOpt.maxWindow = true;
                } else if (event === 'closeWindow') {
                    windowOpt.quiteApp = true;
                }
                ipcRenderer.send('resizeMainWindowSizeMsg', windowOpt);
            },
            logout() {
                console.log('注销操作');
                this.$router.push({
                    name: 'login'
                });

                let userName = this.$store.state.account.accountName;
                let requestID = Utils.getNewRequestID();
                ipcRenderer.send('sendPackStepA', {
                    packName: 'ReqUserLogoutTopic',
                    opts: {
                        UserID: userName,
                        ParticipantID: ''
                    },
                    requestID: requestID
                });
            }
        }
    };
</script>
