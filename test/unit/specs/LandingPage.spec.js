import Vue from 'vue'  // 导入Vue用于生成Vue实例
import LandingPage from '@/components/LandingPage/LandingPage'  // 导入组件

// 测试脚本里面应该包括一个或多个describe块，称为测试套件（test suite）
describe('LandingPage.vue', () => {
    // 每个describe块应该包括一个或多个it块，称为测试用例（test case）
    it('should render correct contents', () => {
        const vm = new Vue({
            el: document.createElement('div'),
            render: h => h(LandingPage)
        }).$mount()
        //断言：DOM中class为hello的元素中的h1元素的文本内容为Welcome to Your Vue.js App
        expect(vm.$el.querySelector('.title').textContent).to.contain('Welcome to your new project!')
    })
})
