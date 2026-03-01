import { Container } from 'unstated';
import { test1, test2, test3, test4, test5, test6 } from '../assets/example-inputs';

const initialFiles = [
  {
    name: 'test1.js',
    savedCode: test1,
    code: test1,
    watchVariables: ['courseName'],
    selected: false,
  },
  {
    name: 'test2.js',
    savedCode: test2,
    code: test2,
    watchVariables: ['sum'],
    selected: false,
  },
  {
    name: 'test3.js',
    savedCode: test3,
    code: test3,
    watchVariables: ['courseNames'],
    selected: false,
  },
  {
    name: 'test4.js',
    savedCode: test4,
    code: test4,
    watchVariables: ['realMean'],
    selected: false,
  },
  {
    name: 'test5.js',
    savedCode: test5,
    code: test5,
    watchVariables: ['universityMean', 'realMean'],
    selected: false,
  },
  {
    name: 'test6.js',
    savedCode: test6,
    code: test6,
    watchVariables: ['average'],
    selected: false,
  },
];

const createTabs = (createTabRef) => {
  return initialFiles.map((tab, index) => ({
    ...tab,
    selected: index === 0,
    ref: createTabRef(),
  }));
};

export default class EditorContainer extends Container {
  constructor({ createTabRef }) {
    super();
    this.createTabRef = createTabRef;
    this.state = {
      tabs: createTabs(createTabRef),
    };
  }

  getSelectedTab = () => {
    return this.state.tabs.filter((tab) => tab.selected === true);
  };

  getTabByName = (name) => {
    return this.state.tabs.find((tab) => tab.name === name);
  };

  saveCode = () => {
    const [selectedTab] = this.getSelectedTab();
    if (!selectedTab) return;

    const tabs = this.state.tabs.map((tab) =>
      tab === selectedTab ? { ...tab, savedCode: tab.code } : tab,
    );

    this.state = {
      ...this.state,
      tabs,
    };
  };

  updateTabCode = (code) => {
    const [selectedTab] = this.getSelectedTab();
    if (!selectedTab) return;

    const tabs = this.state.tabs.map((tab) =>
      tab === selectedTab ? { ...tab, code, savedCode: code } : tab,
    );

    this.state = {
      ...this.state,
      tabs,
    };
  };

  updateTabs = (tabs) => {
    this.state = {
      ...this.state,
      tabs,
    };
  };

  removeTab = (name) => {
    this.state = {
      ...this.state,
      tabs: this.state.tabs.filter((tab) => tab.name !== name),
    };
  };

  newTab = () => {
    const tab = {
      name: '',
      code: '',
      savedCode: '',
      watchVariables: [],
      selected: false,
      ref: this.createTabRef(),
    };

    this.state = {
      ...this.state,
      tabs: [...this.state.tabs, tab],
    };
  };

  saveTabName = (name) => {
    let filename = name;
    if (filename.substr(-3) !== '.js') filename = filename.concat('.js');

    const tabs = this.state.tabs.map((tab) => {
      if (!Boolean(tab.name)) {
        return {
          ...tab,
          name: filename,
        };
      }
      return tab;
    });

    this.state = {
      ...this.state,
      tabs,
    };

    return filename;
  };

  selectTab = (name, { isRunning }) => {
    if (isRunning) {
      alert('Sorry, you need stop this execution before change the code! :)');
      return { blocked: true };
    }

    const { tabs } = this.state;
    let oldSelectedTabIndex = -1;
    let newSelectedTabIndex = -1;

    tabs.forEach((tab, index) => {
      if (tab.selected === true) oldSelectedTabIndex = index;
      if (tab.name === name) newSelectedTabIndex = index;
    });

    if (newSelectedTabIndex < 0) {
      return { blocked: true };
    }

    if (oldSelectedTabIndex === newSelectedTabIndex) {
      return { unchanged: true };
    }

    const tabsUpdated = tabs.map((tab, index) => ({
      ...tab,
      selected: index === newSelectedTabIndex,
    }));

    this.state = {
      ...this.state,
      tabs: tabsUpdated,
    };

    return {
      oldSelectedTabIndex,
      newSelectedTabIndex,
      watchVariables: tabsUpdated[newSelectedTabIndex].watchVariables,
    };
  };
}
