<template>
    <div>
        <h2 style="background: orange">app视图</h2>
        <Button type="primary" @click="onClickForLogin">获取APP列表</Button>
        <div v-for="app in appList">
            <Card style="width:350px">
                <p slot="app.Address">
                    <Icon type="ios-film-outline"></Icon>
                    Classic film
                </p>
                <ul>
                    <li v-for="item in randomMovieList">
                        <a :href="item.url" target="_blank">{{ item.name }}</a>
                        <span>
                    <Icon type="ios-star" v-for="n in 4" :key="n"></Icon><Icon type="ios-star" v-if="item.rate >= 9.5"></Icon><Icon type="ios-star-half"
                                                                                                                                    v-else></Icon>
                    {{ item.rate }}
                </span>
                    </li>
                </ul>
            </Card>
        </div>
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
                appList: []
            };
        },
        methods: {
            onClickForLogin() {
                this.appList = dataManager.getAppList();
                debugger;
            }
        }
    };
</script>