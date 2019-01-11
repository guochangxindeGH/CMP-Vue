const state = {
    warningCount: 100
};

const mutations = {
    warning_add(state) {
        state.warningCount++;
    }
};

const actions = {
    someAsyncTask({commit}) {
        // do something async
        commit('warning_add');
    }
};

export default {
    state,
    mutations,
    actions
};
