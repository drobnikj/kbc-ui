const COMPONENT_ID = 'apify.apify';

import {List, Map} from 'immutable';
import getDefaultBucket from '../../utils/getDefaultBucket';
import _ from 'underscore';
import InstalledComponentStore from '../components/stores/InstalledComponentsStore';

export const storeMixins = [InstalledComponentStore];

export default function(configId) {
  const localState = () => InstalledComponentStore.getLocalState(COMPONENT_ID, configId) || Map();
  const configData =  InstalledComponentStore.getConfigData(COMPONENT_ID, configId) || Map();
  const parameters = configData.get('parameters', Map());
  const inputTables = configData.getIn(['storage', 'input', 'tables'], List());
  const defaultOutputBucket = getDefaultBucket('in', COMPONENT_ID, configId);

  return {
    inputTable: inputTables.first(),
    parameters: parameters,
    configData: configData,
    outputBucket: defaultOutputBucket,
    // local state stuff
    getLocalState(path) {
      if (_.isEmpty(path)) {
        return localState() || Map();
      }
      return localState().getIn([].concat(path), Map());
    }

  };
}
