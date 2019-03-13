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
                        <Input v-model="formValidate.name" placeholder="请输入用户名"/>
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
    import {mapState, mapMutations} from 'vuex';

    export default {
        name: 'Login',
        data() {
            return {
                is_Login: 'false',
                loginUrl: 'http://localhost:3000/api/login?',
                formValidate: {
                    // 默认值从本地拿到
                    name: '',
                    passwd: '',
                    rememberPasswd: ''
                },
                ruleValidate: {
                    name: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    passwd: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        {type: 'string', min: 1, message: '无效的密码长度', trigger: 'blur'}
                    ]
                },
            };
        },
        created: function () {
            console.log('登陆界面初始化');
            ipcRenderer.on('dataChange', this.onLoginResult);
            ipcRenderer.send('resizeMainWindowSizeMsg', {
                isLoginScreen: true
            });
        },
        // computed: {
        //     ...mapState([
        //         'accountName',
        //         'accountPasswd',
        //         'rememberPasswd',
        //         'loginState',
        //         'counter',
        //         'warningCount'
        //     ])
        // },
        // computed: {
        //     ...mapState({
        //         accountName: state => state.counter.accountName
        //     })
        // },
        computed: {
            accountName () {
                return this.$store.state.counter.accountName
            },
            accountPasswd () {
                return this.$store.state.counter.accountPasswd
            },
            rememberPasswd () {
                return this.$store.state.counter.rememberPasswd
            },
            loginState () {
                return this.$store.state.counter.loginState
            },
            warningCount () {
                return this.$store.state.warningStore.warningCount
            },
        },

        mounted: function () {
            this.formValidate.name = this.accountName
            this.formValidate.passwd = this.accountPasswd
            // this.formValidate.rememberPasswd = this.$store.state.counter.rememberPasswd
        },
        destroyed: function () {
            console.log('登陆界面销毁');
            ipcRenderer.removeListener('dataChange', this.onLoginResult);
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
                        // 将用户输入存储本地和内存
                        this.setAccountName(this.formValidate.name);
                        this.setAccountPasswd(this.formValidate.passwd);
                        this.setRememberPasswd(this.formValidate.rememberPasswd);
                        this.setLoginState(true);
                        this.$Message.success('登陆成功!');
                        // 跳转主界面
                        // this.$router.push({
                        //     name: 'main'
                        // });
                    }
                }
            },
            onClickForClose() {
                this.$Message.info('关闭窗口')
                // window.close()
            },
            onClickForLogin(name) {
                let loginData = {
                    "username": this.formValidate.name,
                    "password": this.formValidate.passwd
                }
                // this.$http
                //     .get(this.loginUrl+`username=${this.formValidate.name}&password=${this.formValidate.passwd}`)
                //     .then(res=>{
                //         console.log('res=>',res)
                // })
                this.$http({
                    url: this.loginUrl,
                    method:"get",
                    data:loginData
                }).then((response) => {
                    // debugger;
                    this.is_Login = 'true'
                    console.log('response');
                }).catch((error) => {
                    console.log(error);
                });
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let requestID = Utils.getNewRequestID();
                        ipcRenderer.send('sendPackStepA', {
                            packName: 'ReqUserLoginTopic',
                            opts: {
                                TradingDay: '',
                                UserID: this.formValidate.name,
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
                        console.log('accountName:' + this.accountName);
                        console.log('accountPasswd:' + this.accountPasswd);
                        console.log('rememberPasswd:' + this.rememberPasswd);
                        console.log('loginState:' + this.loginState);
                        console.log('warning:' + this.warning);
                    }
                });
            },
            ...mapMutations([
                'setAccountName',
                'setAccountPasswd',
                'setRememberPasswd',
                'setLoginState',
                'warning_add'
            ])
        },

    }
</script>
