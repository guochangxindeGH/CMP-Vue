
import Vue from 'vue'
import Login from '@/components/loginScreen/Login'
import {mount} from 'vue-test-utils'



describe('Login.vue', () => {

    before(function() {
        // 在本区块的所有测试用例之前执行
    });

    after(function() {
        // 在本区块的所有测试用例之后执行
    });

    beforeEach(function() {
        // 在本区块的每个测试用例之前执行
    });

    afterEach(function() {
        // 在本区块的每个测试用例之后执行
    });

    // test cases

    // it('异步请求应该返回一个对象', done => {
    //     request
    //         .get('https://api.github.com')
    //         .end(function(err, res){
    //             expect(res).to.be.an('object');
    //             done();
    //         });
    // });

    it('点击关闭窗口按钮，触发点击事件', function () {
        const wrapper = mount(Login)

        const closeButton = wrapper.find('.closeBtn')
        closeButton.trigger('click')
    });


    it('点击登陆后，触发点击事件 ', function () {
        const wrapper = mount(Login)

        const loginButton = wrapper.find('.loginBtn')
        loginButton.trigger('click')

        const username = wrapper.vm.formValidate.name
        const password = wrapper.vm.formValidate.passwd
        const islogin = wrapper.vm.isLogin
        const alertStr = wrapper.find('ivu-form-item-error-tip')
        expect(islogin.text()).to.equal('true')
    });

})
