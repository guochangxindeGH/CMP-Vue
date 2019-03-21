//父组件通过标签上面定义传值
<template>
    <section>
        <Layout class="layout">
            <div class="header">
                <!--<RadioGroup class="radioView" mode="horizontal" size="large" @on-change="onTypeChanged" v-model="title">-->
                    <h2 class="radioView">告警视图</h2>
                <!--</RadioGroup>-->
            </div>
        </Layout>
        <Content :style="{margin: '28px 5px 0', background: '#fff', minHeight: '300px'}">
            <app1 @suntofather="sun" v-for="item in groceryList"
                  :title="item.id"
                  :cont="item.text">
            </app1>
            <app2 @suntofather="sun" @input="value = arguments[0]" :value="value"></app2>
        </Content>
        <input type="text" @input="value = arguments[0].target.value" :value="value">
        <button style="background: #ff6666" @click="addObjB">添加obj.b</button>
        <button style="background: aqua" @click="deleteObj">删除obj.b</button>

    </section>
</template>

<script>
    // import {mapState, mapMutations} from 'vuex';
    //引入子组件
    import item1 from 'dirScreens/warningScreen/app-1'
    import item2 from 'dirScreens/warningScreen/app-2'


    export default {
        name: 'demo1',
        data() {
            return {
                title: 'hello!',
                value: '123',
                groceryList: [
                    { id: 0, text: '我要向子组件传递数据0' },
                    { id: 1, text: '我要向子组件传递数据1' },
                    { id: 2, text: '我要向子组件传递数据2' },
                    { id: 3, text: '我要向子组件传递数据3' }
                ]
            }
        },
        // created: {
        //
        // },
        //初始化组件
        components: {
            'app1': item1,
            'app2': item2
        },
        mounted: function () {    //el 被新创建的 vm.$el 替换，并挂载到实例上去之后调用该钩子。
            console.log()
            this.$nextTick(function () {
                // Code that will run only after the
                // entire view has been rendered
            })
        },
        updated: function () {    //由于数据更改导致的虚拟 DOM 重新渲染和打补丁，在这之后会调用该钩子。
            this.$nextTick(function () {
                // Code that will run only after the
                // entire view has been re-rendered
            })
        },

        methods: {
            sun (params) {
                console.log(params)
                for (let i = 0; i < 5; i++) {
                    setTimeout(function() {
                        console.log(new Date, i);
                    }, 1000);
                }
            },
            onTypeChanged(name) {
                console.log('name:' + name);
                this.$router.push({
                    name: name
                });
            },
            addObjB () {
                this.groceryList.push({
                    id: 4,
                    text: 'objB'
                })
                console.log(this.groceryList)

                this.b = 'obj.b'
                // 在Vue实例创建时，obj.b并未声明，因此就没有被Vue转换为响应式的属性，自然就不会触发视图的更新
                this.$set(this.b, 'b', 'obj.b')   // $set()方法相当于手动的去把obj.b处理成一个响应式的属性，此时视图也会跟着改变了
                debugger
                console.log(this.b)
                this.$delete(this.b, 'obj.b')
            },
            deleteObj () {
                var a=[1,2,3,4]
                var b=[1,2,3,4]
                delete a[1]
                console.log(a)
                this.$delete(b,1)
                console.log(b)
            }
        },
        watch: {     // 用来监控data中对象属性的变化
            'value': {
                handler (newName, oldName) {
                    console.log('obj.a changed')
                },
                // deep: true    //deep属性表示深层遍历，但是这么写会监控obj的所有属性变化，并不是我们想要的效果
            }
        },
        computed: {   // 也可以监控data中对象的变化
            a1 () {
                debugger;
                return this.obj.a
            }

        },
        destroyed () {  //Vue 实例销毁后调用。

        }
    };
</script>


<style scoped lang="less">
    .layout {
        border: 1px solid grey;
        position: relative;
        border-radius: 0px;
        overflow: hidden;
        background: @globalBgColorLight;
    }

    .header {
        margin: 0 auto;
        margin-left: 20px;
        margin-right: 20px;

        .radioView {
            width: 100%;
            text-align: center;
            font-size: 20px;
        }
    }
</style>
