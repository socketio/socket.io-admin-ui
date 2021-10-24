
export default {
    namespaced: true,
    state: {
        drawer: null
    },
    mutations: {
        toggle(state, drawerState = null){
            state.drawer = ( drawerState == null ) ? !state.drawer : drawerState;
        }
    }
}