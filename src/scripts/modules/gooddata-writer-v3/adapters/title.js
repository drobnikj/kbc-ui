import Immutable, {Map} from 'immutable';
const createConfiguration = (localState) => {
  const title = localState.get('title');
  const identifier = localState.get('identifier');
  return Immutable.fromJS({title, identifier});
};

export default {
  createConfiguration,
  parseConfiguration(rootParsedConfiguration) {
    return Map({
      title: rootParsedConfiguration.get('title'),
      identifier: rootParsedConfiguration.get('identifier')
    });
  },

  createEmptyConfiguration(name, webalizedName) {
    const initState = {
      title: webalizedName,
      identifier: ''
    };
    return createConfiguration(Immutable.fromJS(initState));
  }
};
