import * as storeProvisioning from './storeProvisioning';
import {Map, List, fromJS} from 'immutable';
import _ from 'underscore';
import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';

import getDefaultPort from './templates/defaultPorts';
import {getProtectedProperties} from './templates/credentials';

export function loadConfiguration(componentId, configId) {
  if (!createActions(componentId).sourceTablesLoaded(configId)) {
    createActions(componentId).updateLocalState(configId, storeProvisioning.loadingSourceTablesPath, true);
  }
  return componentsActions.loadComponentConfigData(componentId, configId);
}

export function loadSourceTables(componentId, configId) {
  if (!createActions(componentId).sourceTablesLoaded(configId)) {
    return createActions(componentId).getSourceTables(configId);
  }
}

export function createActions(componentId) {
  function resetProtectedProperties(credentials) {
    const props = List(getProtectedProperties(componentId));
    return props.reduce((memo, prop) => memo.set(prop, ''), credentials);
  }

  function updateProtectedProperties(newCredentials, oldCredentials) {
    const props = getProtectedProperties(componentId);
    const propsList = List(props);
    const result = propsList.reduce((memo, prop) => {
      const newValue = newCredentials.get(prop);
      const oldValue = oldCredentials.get(prop);
      if (!newValue) {
        return memo.set(prop, oldValue);
      }
      return memo;
    }, newCredentials);
    return result;
  }

  function getStore(configId) {
    return storeProvisioning.createStore(componentId, configId);
  }

  function saveConfigData(configId, data, waitingPath, changeDescription) {
    updateLocalState(configId, waitingPath, true);
    return componentsActions.saveComponentConfigData(componentId, configId, data, changeDescription)
      .then(() => updateLocalState(configId, waitingPath, false));
  }

  function updateLocalState(configId, path, data) {
    const ls = getStore(configId).getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  return {
    componentSupportsSimpleSetup() {
      const nonSupportedComponents = [
        'keboola.ex-db-firebird',
        'keboola.ex-db-impala'
      ];
      if (nonSupportedComponents.indexOf(componentId) > -1) {
        return false;
      }
      return true;
    },

    setQueriesFilter(configId, query) {
      updateLocalState(configId, 'queriesFilter', query);
    },

    editCredentials(configId) {
      const store = getStore(configId);
      let credentials = store.getCredentials();
      if (!credentials.get('port') &&  getDefaultPort(componentId)) {
        credentials = credentials.set('port', getDefaultPort(componentId));
      }
      credentials = resetProtectedProperties(credentials);
      updateLocalState(configId, 'editingCredentials', credentials);
    },

    cancelCredentialsEdit(configId) {
      updateLocalState(configId, 'editingCredentials', null);
    },

    updateEditingCredentials(configId, newCredentials) {
      updateLocalState(configId, 'editingCredentials', newCredentials);
    },

    resetNewQuery(configId) {
      updateLocalState(configId, ['newQueries'], Map());
    },

    changeQueryEnabledState(configId, qid, newValue) {
      const store = getStore(configId);
      const newQueries = store.getQueries().map((q) => {
        if (q.get('id') === qid) {
          return q.set('enabled', newValue);
        } else {
          return q;
        }
      });
      const prefixMsg = !!newValue ? 'Enable' : 'Disable';
      const diffMsg = prefixMsg + ' query ' + store.getQueryName(qid);
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      return saveConfigData(configId, newData, ['pending', qid, 'enabled'], diffMsg);
    },

    updateNewQuery(configId, newQuery) {
      updateLocalState(configId, ['newQueries', 'query'], newQuery);
    },

    resetNewCredentials(configId) {
      updateLocalState(configId, ['newCredentials'], null);
    },

    updateNewCredentials(configId, newCredentials) {
      updateLocalState(configId, ['newCredentials'], newCredentials);
    },

    saveNewCredentials(configId) {
      const store = getStore(configId);
      let newCredentials = store.getNewCredentials();
      newCredentials = updateProtectedProperties(newCredentials, store.getCredentials());
      const newData = store.configData.setIn(['parameters', 'db'], newCredentials);
      const diffMsg = 'Save new credentials';
      return saveConfigData(configId, newData, ['isSavingCredentials'], diffMsg).then(() => this.resetNewCredentials(configId));
    },

    checkTableName(query, store) {
      const defaultTableName = store.getDefaultOutputTableId(query);
      if (query.get('outputTable', '').trim().length > 0) {
        return query;
      } else {
        return query.set('outputTable', defaultTableName);
      }
    },

    createQuery(configId) {
      const store = getStore(configId);
      let newQuery = this.checkTableName(store.getNewQuery(), store);
      if (newQuery.get('query') === '' || !store.localState.get('useQueryEditor')) {
        newQuery = newQuery.delete('query');
      } else {
        newQuery = newQuery.delete('table');
        newQuery = newQuery.delete('columns');
      }
      const newQueries = store.getQueries().push(newQuery);
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      const diffMsg = 'Create query ' + newQuery.get('name');
      return saveConfigData(configId, newData, ['newQueries', 'isSaving'], diffMsg).then(() => this.resetNewQuery(configId));
    },

    saveCredentialsEdit(configId) {
      const store = getStore(configId);
      let credentials = store.getEditingCredentials();
      credentials = updateProtectedProperties(credentials, store.getCredentials());
      const newConfigData = store.configData.setIn(['parameters', 'db'], credentials);
      const diffMsg = 'Update credentials';
      return saveConfigData(configId, newConfigData, 'isSavingCredentials', diffMsg).then(() => this.cancelCredentialsEdit(configId));
    },

    deleteQuery(configId, qid) {
      const store = getStore(configId);
      const newQueries = store.getQueries().filter((q) => q.get('id') !== qid);
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      const diffMsg = 'Delete query ' + store.getQueryName(qid);
      return saveConfigData(configId, newData, ['pending', qid, 'deleteQuery'], diffMsg);
    },

    updateEditingQuery(configId, query) {
      const queryId = query.get('id');
      updateLocalState(configId, ['editingQueries', queryId], query);
    },

    editQuery(configId, queryId) {
      const query = getStore(configId).getConfigQuery(queryId);
      updateLocalState(configId, ['editingQueries', queryId], query);
    },

    cancelQueryEdit(configId, queryId) {
      updateLocalState(configId, ['editingQueries', queryId], null);
    },

    saveQueryEdit(configId, queryId) {
      const store = getStore(configId);
      let newQuery = store.getEditingQuery(queryId);
      if (newQuery.get('query') === '' || !store.getLocalState().get(['useQueryEditor'])) {
        newQuery = newQuery.delete('query');
      } else {
        newQuery = newQuery.delete('table');
        newQuery = newQuery.delete('columns');
      }
      newQuery = this.checkTableName(newQuery, store);
      const newQueries = store.getQueries().map((q) => q.get('id') === queryId ? newQuery : q);
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      const diffMsg = 'Edit query '  + newQuery.get('name');
      return saveConfigData(configId, newData, ['savingQueries'], diffMsg).then(() => this.cancelQueryEdit(configId, queryId));
    },

    testCredentials(configId, credentials) {
      const store = getStore(configId);
      const testingCredentials = updateProtectedProperties(credentials, store.getCredentials());
      let runData = store.configData.setIn(['parameters', 'tables'], List());
      runData = runData.setIn(['parameters', 'db'], testingCredentials);
      const params = {
        configData: runData.toJS()
      };
      return callDockerAction(componentId, 'testConnection', params);
    },

    prepareSingleQueryRunData(configId, query) {
      const store = getStore(configId);
      const runData = store.configData.setIn(['parameters', 'tables'], List().push(query));
      return runData;
    },

    sourceTablesLoaded(configId) {
      const store = getStore(configId);
      return !!store.getSourceTables(configId);
    },

    getSourceTables(configId) {
      const store = getStore(configId);
      const credentials = store.getCredentials();
      if (credentials) {
        let runData = store.configData.setIn(['parameters', 'tables'], List());
        runData = runData.setIn(['parameters', 'db'], store.getCredentials());
        const params = {
          configData: runData.toJS()
        };
        return callDockerAction(componentId, 'getTables', params).then(function(data) {
          updateLocalState(configId, storeProvisioning.sourceTablesPath, fromJS(data.tables));
          updateLocalState(configId, storeProvisioning.loadingSourceTablesPath, false);
        });
      }
    },

    updateLocalState(configId, path, data) {
      return updateLocalState(configId, path, data);
    },

    // returns localState for @path and function to update local state
    // on @path+@subPath
    prepareLocalState(configId, path) {
      const ls = getStore(configId).getLocalState(path);
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
        prepareLocalState: (newSubPath) => this.prepareLocalState([].concat(path).concat(newSubPath))
      };
    }
  };
}
