//Counter.spec.js

import Vue from 'vue'
import Counter from '@/components/demo/Counter'
import {mount} from 'vue-test-utils'

describe('Counter.vue', () => {

    it('count异步更新, count的值应该为1', (done) => {
        ///获取组件实例
        const Constructor = Vue.extend(Counter);
        //挂载组件
        const vm = new Constructor().$mount();
        const wrapper = mount(Counter);

        //获取button
        const button = vm.$el.querySelectorAll('button')[1];
        //新建点击事件
        const clickEvent = new window.Event('click');

        //触发点击事件
        button.dispatchEvent(clickEvent);
        //监听点击事件
        vm._watcher.run();
        //1s后进行断言
        window.setTimeout(() => {
            // 断言:count的值应该是数字1
            expect(wrapper.find('h3').text()).to.equal('Counter.vue');
            // expect(Number(vm.$el.querySelector('.num').textContent)).to.equal(1);
            done();
        }, 1000);
    })

})
