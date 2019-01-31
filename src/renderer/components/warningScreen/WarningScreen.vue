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
            <todo-item v-for="item in groceryList"
                  :title="item.id"
                  :cont="item.text">
            </todo-item>
            <app2></app2>
        </Content>

    </section>
</template>

<script>
    // import {mapState, mapMutations} from 'vuex';
    import item1 from 'dirScreens/warningScreen/app-1'
    import item2 from 'dirScreens/warningScreen/app-2'


    export default {
        name: 'demo1',
        data() {
            return {
                title: 'hello!',
                groceryList: [
                    { id: 0, text: '蔬菜' },
                    { id: 1, text: '奶酪' },
                    { id: 2, text: '随便其它什么人吃的东西' }
                ]
            }
        },
        // created: {
        //
        // },
        components: {
            'todo-item': item1,
            'app2': item2
        },
        // mounted: {
        //
        // },
        // computed: {
        //
        // },
        methods: {
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