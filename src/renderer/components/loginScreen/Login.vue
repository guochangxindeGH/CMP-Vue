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
                    <FormItem label="账户" prop="name">
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
    import secret from 'dirUtil/secret';
    import timeCom from 'dirUtil/TimeUtils'
    import {ipcRenderer} from 'electron';
    import {mapState, mapMutations} from 'vuex';

    let timeUtils = new timeCom()

    export default {
        name: 'Login',
        data() {
            return {
                message: 'gcx is boy',
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
        // }, d
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
        beforeCreate: function () {
            console.group('beforeCreate 创建前状态===============》');
            console.log("%c%s", "color:red" , "el     : " + this.$el); //undefined
            console.log("%c%s", "color:red","data   : " + this.$data); //undefined
            console.log("%c%s", "color:red","message: " + this.message)
        },
        created: function () {
            console.group('beforeCreate 创建完成状态===============》');
            console.log("%c%s", "color:red" , "el     : " + this.$el); //undefined
            console.log("%c%s", "color:red","data   : " + this.$data); //undefined
            console.log("%c%s", "color:red","message: " + this.message)
            ipcRenderer.on('dataChange', this.onLoginResult);
            ipcRenderer.send('resizeMainWindowSizeMsg', {
                isLoginScreen: true
            });
        },
        beforeMount: function () {
            console.group('beforeMount 挂载前状态===============》');
            console.log("%c%s", "color:red","el     : " + (this.$el)); //已被初始化
            console.log(this.$el);
            console.log("%c%s", "color:red","data   : " + this.$data); //已被初始化
            console.log("%c%s", "color:red","message: " + this.message); //已被初始化
        },
        mounted: function () {
            console.log(this.$el);
            console.log("%c%s", "color:red","message: " + this.message); //已被初始化
            this.formValidate.name = this.accountName
            this.formValidate.passwd = this.accountPasswd
            // this.formValidate.rememberPasswd = this.$store.state.counter.rememberPasswd
        },
        beforeUpdate: function () {
            console.group('beforeUpdate 更新前状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el);
            console.log("%c%s", "color:red","data   : " + this.$data);
            console.log("%c%s", "color:red","message: " + this.message);
        },
        updated: function () {
            console.group('updated 更新完成状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el);
            console.log("%c%s", "color:red","data   : " + this.$data);
            console.log("%c%s", "color:red","message: " + this.message);
        },
        beforeDestroy: function () {
            console.group('beforeDestroy 销毁前状态===============》');
            console.log("%c%s", "color:red","el     : " + this.$el);
            console.log(this.$el);
            console.log("%c%s", "color:red","data   : " + this.$data);
            console.log("%c%s", "color:red","message: " + this.message);
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
                        this.$router.push({
                            name: 'main'
                        });
                    }
                }
            },
            onClickForClose() {
                this.$Message.info('关闭窗口')
                // window.close()
            },
            onClickForLogin(name) {
                let time = timeUtils.getCurDataStr()
                let loginData = {
                    "userName": this.formValidate.name,
                    "password": crypto.createHash('md5').update(crypto.createHash('md5').update(this.formValidate.passwd, 'utf-8').digest('hex') + time, 'utf-8').digest('hex')
                }
                let finalData = secret.Encrypt(loginData.username)
                let clearData = secret.Decrypt(finalData)
                this.$http({
                    url: this.loginUrl,
                    method:"get",
                    data:loginData
                }).then((response) => {
                    // debugger;
                    this.is_Login = 'true'
                    console.log(response)
                    // this.$router.push({
                    //     name: 'main'
                    // });
                }).catch((error) => {
                    console.log(error)
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
