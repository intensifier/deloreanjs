import StoreFacade from '../StoreFacade';

const createStore = () => {
  return new StoreFacade({
    createTabRef: () => ({ current: null }),
    renderEditor: () => null,
  });
};

describe('StoreFacade', () => {
  beforeEach(() => {
    global.heap = {
      dependencies: [],
      snapshots: [],
    };
    global.dependencies = [];
    global.implicitTimepoints = false;
  });

  test('selectTab prepares watch variables from selected file', () => {
    const store = createStore();

    store.selectTab('test1.js');

    expect(store.state.watchVariables).toEqual(['courseName']);
    expect(store.getSelectedTab()[0].name).toBe('test1.js');
  });

  test('tab creation and naming keeps .js suffix', () => {
    const store = createStore();

    store.newTab();
    store.saveTabName('scratch');

    expect(store.state.tabs.some((tab) => tab.name === 'scratch.js')).toBe(true);
  });

  test('watch container add/remove keeps state in sync', () => {
    const store = createStore();

    store.addVariableValue('average');
    expect(store.state.watchVariables).toContain('average');

    store.deleteWatchVariable('average');
    expect(store.state.watchVariables).not.toContain('average');
  });
});
