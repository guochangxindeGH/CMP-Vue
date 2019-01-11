const state = {
    counter: 0,
    main: 0,
    accountName: '',
    accountPasswd: '',
    rememberPasswd: false,
    // 是否已经登陆
    loginState: false
}

/**
 * 设置一些状态
 * 只能传递第二个参数
 */
const mutations = {
    counter_add(state) {
        state.counter++;
    },
    DECREMENT_MAIN_COUNTER (state) {
        state.main--
    },
    INCREMENT_MAIN_COUNTER (state) {
        state.main++
    },setAccountName(state, name) {
        state.accountName = name;
    },
    setAccountPasswd(state, passwd) {
        state.accountPasswd = passwd;
    },
    setRememberPasswd(state, remember) {
        state.rememberPasswd = remember;
    },
    setLoginState(state, loginState) {
        state.loginState = loginState;
    }
}

/**
 * 获取当前登陆状态
 */
const getters = {
    getLoginState(state) {
        return state.accountName;
    }
};

const actions = {
    someAsyncTask ({ commit }) {
        // do something async
        commit('counter_add')
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
