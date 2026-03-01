import { Container } from 'unstated';

export default class WatchContainer extends Container {
  constructor() {
    super();
    this.state = {
      watchVariables: [],
    };
  }

  setVariables = (variables) => {
    this.state = {
      ...this.state,
      watchVariables: variables,
    };
  };

  resetWatchVariables = (variables) => {
    this.setVariables(variables);
    global.dependencies = variables.map((name) => ({
      name,
      type: 'normal',
    }));
  };

  addVariable = (value) => {
    if (!value || this.state.watchVariables.includes(value)) return;

    this.state = {
      ...this.state,
      watchVariables: [...this.state.watchVariables, value],
    };

    if (!global.dependencies) {
      global.dependencies = [];
    }

    global.dependencies.push({ name: value, type: 'normal' });
  };

  removeVariable = (value) => {
    this.state = {
      ...this.state,
      watchVariables: this.state.watchVariables.filter((variable) => variable !== value),
    };

    if (!global.dependencies) return;

    global.dependencies = global.dependencies.filter((dependency) => dependency.name !== value);
  };
}
