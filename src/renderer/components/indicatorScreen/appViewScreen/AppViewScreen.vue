<template>
    <div>
        <Row>
            <Col span="6" v-for="app in hostList">
                <Card style="margin: 10px 20px">
                    <p slot="title" style="text-align: center">
                        {{app.AppName}}
                    </p>
                    <ul>
                        <li style="margin-top: 10px" v-for="(attrValue, attrName) of app.attrList">
                            <span style="color: black">{{attrName}}:</span>
                            <span style="color: black">{{attrValue}}</span>
                        </li>
                    </ul>
                </Card>
            </Col>
        </Row>
    </div>
</template>
<script>
    import * as dataManager from 'dirManagers/dataManager';
    import Vue from 'vue';

    export default {
        created: function () {
            console.log('AppView初始化');
        },
        destroyed: function () {
            console.log('AppView销毁');
        },
        data() {
            return {
                timer: null,
                baseUrl: 'http://172.24.119.2:9090/api/v1/query?',
                hostList: null
            };
        },
        mounted: function () {
            this.hostList = dataManager.getAppList();
            console.log('App 挂载，host list:' + this.hostList);
            // 添加指标
            if (this.hostList) {
                for (let host of this.hostList) {   //因为hostList为null，所以这个地方会报错但不影响结果
                    host.attrList = {
                        '地址': host.Address,
                        'Active': '----',
                        'CpuUsage': '----',
                        'MemUsage': '----',
                        'DiskUsage': '----'
                    };
                }
            }
            this.timer = setInterval(this.getAttrValues, 2000);
        },
        beforeDestroy: function () {
            if (this.timer) {
                console.log('停掉定时器');
                clearInterval(this.timer);
            }
        },
        methods: {
            getAttrValues() {
                debugger;
                console.log('更新指标');
                this.$http
                    .get(this.baseUrl + 'query=up')
                    .then(this.checkResult)
                    .then(this.updateActive);
                this.$http
                    .get(this.baseUrl + 'query=rate(node_cpu_seconds_total{cpu="0",mode="idle"}[5m])')
                    .then(this.checkResult)
                    .then(this.updateCpuUsage);
                this.$http
                    .get(this.baseUrl + 'query=node_memory_MemFree_bytes')
                    .then(this.checkResult)
                    .then(this.updateMemUsage);
                this.$http
                    .get(this.baseUrl + 'query=node_filesystem_avail_bytes')
                    .then(this.checkResult)
                    .then(this.updateDiskUsage);
            },
            checkResult(response) {
                if (response.status === 200) {
                    let resultList = [];
                    for (let host of response.data.data.result) {
                        let ip = host.metric.instance.split(':')[0];
                        let value = host.value[1];
                        resultList.push({
                            ip: ip,
                            value: value
                        });
                    }
                    return resultList;
                }
                return null;
            },
            updateActive(activeList) {
                if (activeList === null) {
                    console.log('指标为空');
                    return;
                }
                for (let hostItem of activeList) {
                    for (let index in this.hostList) {
                        let hostInSys = this.hostList[index];
                        if (hostInSys.Address === hostItem.ip) {
                            if (hostItem.value === '1') {
                                hostInSys.attrList.Active = '活跃';
                            } else {
                                hostInSys.attrList.Active = '不活跃';
                            }
                            Vue.set(this.hostList, index, hostInSys);
                        }
                    }
                }
            },
            updateCpuUsage(cpuList) {
                if (cpuList === null) {
                    console.log('指标为空');
                    return;
                }
                for (let hostItem of cpuList) {
                    for (let index in this.hostList) {
                        let hostInSys = this.hostList[index];
                        if (hostInSys.Address === hostItem.ip) {
                            hostInSys.attrList.CpuUsage = (hostItem.value * 100).toFixed(1) + '%';
                            Vue.set(this.hostList, index, hostInSys);
                        }
                    }
                }
            },
            updateMemUsage(attrList) {
                if (attrList === null) {
                    console.log('指标为空');
                    return;
                }
                for (let hostItem of attrList) {
                    for (let index in this.hostList) {
                        let hostInSys = this.hostList[index];
                        if (hostInSys.Address === hostItem.ip) {
                            hostInSys.attrList.MemUsage = (hostItem.value / 1000000000).toFixed(1) + 'Gb';
                            Vue.set(this.hostList, index, hostInSys);
                        }
                    }
                }
            },
            updateDiskUsage(attrList) {
                if (attrList === null) {
                    console.log('指标为空');
                    return;
                }
                for (let hostItem of attrList) {
                    for (let index in this.hostList) {
                        let hostInSys = this.hostList[index];
                        if (hostInSys.Address === hostItem.ip) {
                            hostInSys.attrList.DiskUsage = (hostItem.value / 1000000000).toFixed(1) + 'Gb';
                            Vue.set(this.hostList, index, hostInSys);
                        }
                    }
                }
            },
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