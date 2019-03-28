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
<template>
    <div>
        <Layout class="layout">
            <div class="header">
                <RadioGroup class="radioView" mode="horizontal" size="large" @on-change="onTypeChanged" v-model="viewType">
                    <Radio label="hardware">
                        <span>设备</span>
                    </Radio>
                    <Radio label="app">
                        <span>App</span>
                    </Radio>
                </RadioGroup>
            </div>
            <Content :style="{margin: '28px 5px 0', background: '#fff', minHeight: '500px'}">
                <router-view></router-view>
            </Content>
        </Layout>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                viewType: 'hardware'
            };
        },
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
