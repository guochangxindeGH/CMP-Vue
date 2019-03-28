

<template>
    <div>
        <Row>
            <i-col class="sysLabel" span="4">
                FZQH.SYS1
            </i-col>
            <i-col class="sysLabel" span="4" offset="8">报单量</i-col>
            <i-col class="sysLabel" span="4">成交量</i-col>
            <i-col class="sysLabel" span="4">在线人数</i-col>
        </Row>
        <Card style="width:350px">
            <p slot="title">
                <Icon type="ios-film-outline"></Icon>
                Classic film
            </p>
            <a href="#" slot="extra" @click.prevent="changeLimit">
                <Icon type="ios-loop-strong"></Icon>
                Change
            </a>
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
        <el-row>
            <el-col :span="6">
                <el-button type="primary" @click="getSystem()">获取系统</el-button>
                <div v-for="sys in sysList">
                    <el-button type="success" >{{sys.member_name + sys.system_name}}</el-button>

                </div>
            </el-col>
            <el-col :span="9">
                <div id="chart1"></div>
            </el-col>
            <el-col :span="9">
                <div id="chart2"></div>
            </el-col>

        </el-row>
        <el-row>
            <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple-light"></div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple-light"></div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple"></div></el-col>
            <el-col :span="4"><div class="grid-content bg-purple-light"></div></el-col>
        </el-row>

    </div>
</template>

<script>

    export default {
        data() {
            return {
                apiUrl: {
                    query_system:'http://localhost:3000/api/query_system?',
                },
                sysList: [
                    {
                        member_name: '',
                        system_name: ''
                    }
                ],
                movieList: [
                    {
                        name: 'The Shawshank Redemption',
                        url: 'https://movie.douban.com/subject/1292052/',
                        rate: 9.6
                    },
                    {
                        name: 'Leon:The Professional',
                        url: 'https://movie.douban.com/subject/1295644/',
                        rate: 9.4
                    },
                    {
                        name: 'Farewell to My Concubine',
                        url: 'https://movie.douban.com/subject/1291546/',
                        rate: 9.5
                    },
                    {
                        name: 'Forrest Gump',
                        url: 'https://movie.douban.com/subject/1292720/',
                        rate: 9.4
                    },
                    {
                        name: 'Life Is Beautiful',
                        url: 'https://movie.douban.com/subject/1292063/',
                        rate: 9.5
                    },
                    {
                        name: 'Spirited Away',
                        url: 'https://movie.douban.com/subject/1291561/',
                        rate: 9.2
                    },
                    {
                        name: 'Schindlers List',
                        url: 'https://movie.douban.com/subject/1295124/',
                        rate: 9.4
                    },
                    {
                        name: 'The Legend of 1900',
                        url: 'https://movie.douban.com/subject/1292001/',
                        rate: 9.2
                    },
                    {
                        name: 'WALL·E',
                        url: 'https://movie.douban.com/subject/2131459/',
                        rate: 9.3
                    },
                    {
                        name: 'Inception',
                        url: 'https://movie.douban.com/subject/3541415/',
                        rate: 9.2
                    }
                ],
                randomMovieList: []
            };
        },
        mounted() {
            this.changeLimit();
            this.drawEchart1()
        },
        watch: {
            sysList: [
                // 'handle1',
                function handle2 (val, oldVal1){

                },
                {
                    handler: function handle2 (val, oldVal2) { /* ... */
                        // debugger
                    }
                }
            ]
        },
        methods: {
            getSystem() {
                this.$http({
                    url: this.apiUrl.query_system,
                    method: 'get',
                    data: ''
                }).then( (response) =>{
                    console.log(response)
                    for (let system of response.data.system) {
                        system.deviceList = []
                        this.sysList.push(system)
                    }
                }).catch( (error) => {
                    console.log(error)
                })
            },
            changeLimit() {
                function getArrayItems(arr, num) {
                    const temp_array = [];
                    for (let index in arr) {
                        temp_array.push(arr[index]);
                    }
                    const return_array = [];
                    for (let i = 0; i < num; i++) {
                        if (temp_array.length > 0) {
                            const arrIndex = Math.floor(Math.random() * temp_array.length);
                            return_array[i] = temp_array[arrIndex];
                            temp_array.splice(arrIndex, 1);
                        } else {
                            break;
                        }
                    }
                    return return_array;
                }

                this.randomMovieList = getArrayItems(this.movieList, 5);
            },
            drawEchart1() {
                let myChart = this.echarts.init(document.getElementById('chart2'));
                // 绘制图表
                myChart.setOption({
                    title: { text: 'ECharts 入门示例' },
                    tooltip: {},
                    xAxis: {
                        type: 'category',
                        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        data: [820, 932, 901, 934, 1290, 1330, 1320],
                        type: 'line',
                        smooth: true
                    }]
                });
            }
        },
        computed: {
            changeSysList() {
                debugger
            }
        },
    };
</script>

<style scoped lang="less">
    .sysLabel {
        color: black;
        text-align: center;
    }
    .el-row {
        margin-bottom: 20px;
        &:last-child {
            margin-bottom: 0;
        }
    }
    .el-col {
        border-radius: 4px;
    }
    .bg-purple-dark {
        background: #99a9bf;
    }
    .bg-purple {
        background: #d3dce6;
    }
    .bg-purple-light {
        background: #e5e9f2;
    }
    .grid-content {
        border-radius: 4px;
        min-height: 36px;
    }
    .row-bg {
        padding: 10px 0;
        background-color: #f9fafc;
    }

    #chart1 {
        /*width: 400px;*/
        height: 400px;
    }
    #chart2 {
        height: 400px;
    }
</style>
