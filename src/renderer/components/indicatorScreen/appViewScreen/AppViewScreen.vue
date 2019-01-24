<template>
    <div>
        <h2 style="background: orange">app视图</h2>
        <Button type="primary" @click="onClickForLogin">获取APP列表</Button>
        <p style="color: #321c67">{{hostList}}</p>
        <Row>
            <Col span="6" v-for="app in hostList">
                <Card style="margin: 10px 20px">
                    <p slot="title">
                        {{app.AppName}}
                    </p>
                    <ul>
                        <li v-for="item in 4">
                            <a :href="item.url" target="_blank">name</a>
                            <span>
                    <Icon type="ios-star" v-for="n in 4" :key="n"></Icon><Icon type="ios-star" v-if="item.rate >= 9.5"></Icon><Icon type="ios-star-half"
                                                                                                                                    v-else></Icon>
rate
                </span>
                        </li>
                    </ul>
                </Card>
            </Col>
        </Row>
    </div>
</template>
<script>
    import * as dataManager from 'dirManagers/dataManager';

    export default {
        created: function () {
            console.log('AppView初始化');
        },
        destroyed: function () {
            console.log('AppView销毁');
        },
        data() {
            return {
                appList: [],
                hostList: dataManager.getAppList()
            };
        },
        mounted: function () {
            console.log('AppView Mount');
        },
        methods: {
            onClickForLogin() {
                this.$http
                    .get('http://172.24.119.2:9090/api/v1/query?query=up')
                    .then((response) => {
                        // this.hostList = response.data.data.result;
                        console.log('主机个数:' + this.hostList.length);
                        console.log('this.instance' + this.hostList[0].metric.instance);
                        console.log('this.up:' + this.hostList[0].value[1]);
                    });
            }
        }
    };
</script>