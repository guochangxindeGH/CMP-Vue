<template>
    <div>
        <div class="titleBar">
            <div class="closeBtn fa fa-close" @click="onClickForClose"></div>
        </div>
        <div class="contentLayout">
            <div class="titleLayout">
                综合监控平台
            </div>
            <div class="formLayout">
                <Form class="form" ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="账户" prop="account">
                        <Input v-model="formValidate.account" placeholder="请输入用户名"/>
                    </FormItem>
                    <FormItem label="密码" prop="passwd">
                        <Input type="password" v-model="formValidate.passwd" placeholder="请输入密码"/>
                    </FormItem>
                    <FormItem label="记住密码" prop="rememberPasswd">
                        <Checkbox v-model="formValidate.rememberPasswd" label="Eat"></Checkbox>
                        <Button class="loginBtn" type="primary" @click="handleSubmit('formValidate')">Submit</Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </div>
</template>

<style scoped lang="less">
    @import "Login";
</style>

<script>
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
        methods: {
            onClickForClose() {
                console.log('ssss');
            },
            handleSubmit(name) {
                console.log('rememberPasswd:' + this.formValidate.rememberPasswd);
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.$Message.success('Success!');
                    } else {
                        this.$Message.error('Fail!');
                    }
                });
            }
        }
    };
</script>
