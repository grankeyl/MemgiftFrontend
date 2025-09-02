const stateGet = (state: any, key: string) => {
    if (!state.value[key]) {
        return Error('State not found');
    }
    return state.value[key];
};

export default stateGet;