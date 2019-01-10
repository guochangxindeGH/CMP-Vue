<template>
    <div id="rootLayout">
        <div class="titleBar">
            <div class="closeBtn fa fa-close" @click="onClickForClose"></div>
        </div>
        <div class="contentLayout">
            <h2>
                综合监控平台
            </h2>
            <div class="formLayout">
                <Form class="form" ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="账户" prop="account">
                        <Input v-model="formValidate.account" placeholder="请输入用户名"/>
                    </FormItem>
                    <FormItem label="密码" prop="passwd">
                        <Input type="password" v-model="formValidate.passwd" placeholder="请输入密码"/>
                    </FormItem>
                    <FormItem label="记住密码" prop="rememberPasswd">
                        <Checkbox v-model="formValidate.rememberPasswd"></Checkbox>
                        <Button class="loginBtn" type="primary" @click="onClickForLogin('formValidate')">登陆</Button>
                    </FormItem>
                </Form>
            </div>
            <p class="copyRight">Copyright © 2015 - 2018 SFIT Inc. All Rights Reserved </p>
        </div>
    </div>
</template>

<style scoped lang="less">
    @import "Login";
</style>

<script>
    import crypto from 'crypto';
    import Utils from 'dirUtil/Utils';
    import {ipcRenderer} from 'electron';

    export default {
        name: 'login-page',
        data() {
            return {
                formValidate: {
                    account: '',
                    passwd: '',
                    rememberPasswd: true
                },
                ruleValidate: {
                    account: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    passwd: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {type: 'string', min: 1, message: '无效的密码长度', trigger: 'blur'}
                    ]
                }
            };
        },
        created: function () {
            console.log('登陆界面初始化');
            ipcRenderer.on('dataChange', this.onLoginResult);
            ipcRenderer.send('resizeMainWindowSizeMsg', true);
        },
        methods: {
            onLoginResult(event, msg) {
                let packName = msg.packName;
                if (packName === 'RspUserLoginTopic') {
                    let docs = JSON.parse(msg.packInfo);
                    let result = docs[0].field[1].values[0];
                    if (result.ErrorID !== 0) {
                        this.$Message.error('登录失败:' + result.ErrorMsg);
                    } else {
                        this.$Message.success('登陆成功!');
                        // 跳转主界面
                        this.$router.push({
                            name: 'main-page'
                        });
                    }
                }
            },
            onClickForClose() {
            },
            onClickForLogin(name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let requestID = Utils.getNewRequestID();
                        ipcRenderer.send('sendPackStepA', {
                            packName: 'ReqUserLoginTopic',
                            opts: {
                                TradingDay: '',
                                UserID: this.formValidate.account,
                                ParticipantID: '',
                                Password: crypto.createHash('md5').update(this.formValidate.passwd).digest('hex').toUpperCase(),
                                UserProductInfo: '',
                                InterfaceProductInfo: '',
                                ProtocolInfo: '',
                                DataCenterID: ''
                            },
                            requestID: requestID
                        });
                    } else {
                        this.$Message.error('格式错误!');
                    }
                });
            }
        }
    };
</script>
