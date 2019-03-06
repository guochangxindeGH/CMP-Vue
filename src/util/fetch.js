import axios from 'axios'
// 封装所有的api异步请求
export default function (url, params) {
    return new Promise((resolve, reject) => {
        axios.get(`/proxy?url=${url}`, {params}).then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}
