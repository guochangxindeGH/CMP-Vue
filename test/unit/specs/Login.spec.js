
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

    it('正确渲染h2的文字为综合监控平台 ', () => {
        const wrapper = mount(Login)
        expect(wrapper.find('h2').text()).to.equal('综合监控平台')
    });

    it('点击关闭窗口按钮，触发点击事件', () => {
        const wrapper = mount(Login)

        const closeButton = wrapper.find('.closeBtn')
        closeButton.trigger('click')
    });


    it('点击登陆后，触发点击事件并且返回结果 ', () => {
        const wrapper = mount(Login)

        const loginButton = wrapper.find('.loginBtn')
        loginButton.trigger('click')

        const username = wrapper.vm.formValidate.name
        const password = wrapper.vm.formValidate.passwd
        let btn = () => {
            const islogin = wrapper.vm.is_Login
            expect(islogin).to.equal('true')
        }
        setTimeout(btn, 2000)

    });

})
