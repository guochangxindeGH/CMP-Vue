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
        <Content :style="{margin: '28px 5px 0', background: '#fff', minHeight: '500px'}">
            <app1 @suntofather="sun" v-for="item in groceryList"
                  :title="item.id"
                  :cont="item.text">
            </app1>
            <app2 @suntofather="sun"></app2>
        </Content>

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
        // mounted: {
        //
        // },
        // computed: {
        //
        // },
        methods: {
            sun (params) {
                debugger;
                console.log(params)
            },
            onTypeChanged(name) {
                console.log('name:' + name);
                this.$router.push({
                    name: name
                });
            }
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