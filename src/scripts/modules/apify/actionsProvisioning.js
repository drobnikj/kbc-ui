import storeProvisioning from './storeProvisioning';
import componentsActions from '../components/InstalledComponentsActionCreators';
import _ from 'underscore';
import callDockerAction from '../components/DockerActionsApi';
import {Map, List} from 'immutable';

const COMPONENT_ID = 'apify.apify';
export default function(configId) {
  const store = storeProvisioning(configId);

  function updateLocalState(path, data) {
    const ls = store.getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  // returns localState for @path and function to update local state
  // on @path+@subPath
  function prepareLocalState(path) {
    const ls = store.getLocalState(path);
    const updateLocalSubstateFn = (subPath, newData)  =>  {
      if (_.isEmpty(subPath)) {
        return updateLocalState([].concat(path), newData);
      } else {
        return updateLocalState([].concat(path).concat(subPath), newData);
      }
    };
    return {
      localState: ls,
      updateLocalState: updateLocalSubstateFn,
      prepareLocalState: (newSubPath) => prepareLocalState([].concat(path).concat(newSubPath))
    };
  }


  function saveConfigData(data, waitingPath, changeDescription) {
    // check default output bucket and save default if non set
    updateLocalState(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, data, changeDescription).then(() => updateLocalState(waitingPath, false));
  }

  function saveConfig(newParams, inputTableId) {
    let data = store.configData.set('parameters', newParams);
    if (inputTableId) {
      const newTable = Map({source: inputTableId});
      data = data.setIn(['storage', 'input', 'tables'], List().push(newTable));
    } else {
      data = data.delete('storage');
    }
    return saveConfigData(data, 'saving', 'Setup crawler');
  }

  return {
    updateLocalState: updateLocalState,
    prepareLocalState: prepareLocalState,
    saveConfig: saveConfig,
    loadCrawlers(settings) {
      const runData = store.configData.setIn(['parameters'], settings);
      const params = {
        configData: runData.toJS()
      };
      return callDockerAction(COMPONENT_ID, 'listCrawlers', params);
    }

  };
}
