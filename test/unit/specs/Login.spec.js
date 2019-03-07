
import Vue from 'vue'
import Login from '@dirScreens/liginScreen/Login'

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

    it('异步请求应该返回一个对象', done => {
        request
            .get('https://api.github.com')
            .end(function(err, res){
                expect(res).to.be.an('object');
                done();
            });
    });


    it('点击按钮后, count的值应该为1', () => {
        //获取组件实例
        const Constructor = Vue.extend(Counter);
        //挂载组件
        const vm = new Constructor().$mount();
        //获取button
        const button = vm.$el.querySelector('button');
        //新建点击事件
        const clickEvent = new window.Event('click');
        //触发点击事件
        button.dispatchEvent(clickEvent);
        //监听点击事件
        vm._watcher.run();
        // 断言:count的值应该是数字1
        expect(Number(vm.$el.querySelector('.num').textContent)).to.equal(1);
    })
})