export default {
    created: function () {
        this.hello();
        // this.onDataChanged();
    },
    methods: {
        async hello() {
            console.log('hello from dushao!');
        }
    }
};
