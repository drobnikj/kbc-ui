import * as storeProvisioning from './storeProvisioning';
import {List, fromJS} from 'immutable';
import RoutesStore from '../../stores/RoutesStore';

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
  const actions = createActions(componentId);
  if (componentSupportsSimpleSetup(componentId) && !actions.sourceTablesLoaded(configId)) {
    createActions(componentId).updateLocalState(configId, storeProvisioning.loadingSourceTablesPath, true);
    return createActions(componentId).getSourceTables(configId);
  }
}

export function componentSupportsSimpleSetup(componentId) {
  const supportedComponents = [
    'keboola.ex-db-mysql',
    'keboola.ex-db-redshift',
    'keboola.ex-db-snowflake',
    'keboola.ex-db-mssql',
    'keboola.ex-db-oracle',
    'keboola.ex-db-db2',
    'keboola.ex-db-pgsql'
  ];
  if (supportedComponents.indexOf(componentId) > -1) {
    return true;
  }
  return false;
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

  function getLocalState(configId) {
    return getStore(configId).getLocalState();
  }

  function updateLocalState(configId, path, data) {
    const ls = getStore(configId).getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function removeFromLocalState(configId, path) {
    const ls = getStore(configId).getLocalState();
    const newLocalState = ls.deleteIn([].concat(path));
    componentsActions.updateLocalState(componentId, configId, newLocalState, path);
  }

  function getPKColumsFromSourceTable(targetTable, sourceTables) {
    var matchedTable = sourceTables.find((table) =>
      table.get('schema') === targetTable.get('schema')
      && table.get('name') === targetTable.get('tableName')
    );
    if (!matchedTable) {
      return [];
    }
    if (matchedTable.get('columns')) {
      return matchedTable.get('columns').filter((column) => column.get('primaryKey') === true);
    } else {
      return [];
    }
  }

  return {
    // Credentials Actions start
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
      removeFromLocalState(configId, ['isChangedCredentials']);
      removeFromLocalState(configId, ['editingCredentials']);
    },

    updateEditingCredentials(configId, newCredentials) {
      updateLocalState(configId, 'editingCredentials', newCredentials);
      if (!getLocalState(configId).get('isChangedCredentials', false)) {
        updateLocalState(configId, ['isChangedCredentials'], true);
      }
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

    saveCredentialsEdit(configId) {
      const store = getStore(configId);
      let credentials = store.getEditingCredentials();
      credentials = updateProtectedProperties(credentials, store.getCredentials());
      const newConfigData = store.configData.setIn(['parameters', 'db'], credentials);
      const diffMsg = 'Update credentials';
      return saveConfigData(configId, newConfigData, ['isSavingCredentials'], diffMsg).then(() => {
        this.cancelCredentialsEdit(configId);
        RoutesStore.getRouter().transitionTo(componentId, {config: configId});
      });
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
    // Credentials actions end

    setQueriesFilter(configId, query) {
      updateLocalState(configId, 'queriesFilter', query);
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

    checkTableName(query, store) {
      const defaultTableName = store.getDefaultOutputTableId(query.get('name', ''));
      if (query.get('outputTable', '').trim().length > 0) {
        return query;
      } else {
        return query.set('outputTable', defaultTableName);
      }
    },

    createQuery(configId) {
      const store = getStore(configId);
      let newQuery = this.checkTableName(store.generateNewQuery(null, componentSupportsSimpleSetup(componentId)), store);
      updateLocalState(configId, ['newQueries', newQuery.get('id')], newQuery);
      this.changeQueryEdit(configId, newQuery);
      return newQuery;
    },

    deleteQuery(configId, qid) {
      const store = getStore(configId);
      removeFromLocalState(configId, ['newQueries', qid]);
      removeFromLocalState(configId, ['editingQueries', qid]);
      const newQueries = store.getQueries().filter((q) => q.get('id') !== qid);
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      const diffMsg = 'Delete query ' + store.getQueryName(qid);
      return saveConfigData(configId, newData, ['pending', qid, 'deleteQuery'], diffMsg);
    },

    prepareSingleQueryRunData(configId, query) {
      const store = getStore(configId);
      const runData = store.configData.setIn(['parameters', 'tables'], List().push(query));
      return runData;
    },

    resetQueryEdit(configId, queryId) {
      removeFromLocalState(configId, ['isChanged', queryId]);
      removeFromLocalState(configId, ['isDestinationEditing', queryId]);
      const store = getStore(configId);
      if (store.isNewQuery(queryId)) {
        const newQuery = store.generateNewQuery(queryId, componentSupportsSimpleSetup(componentId));
        updateLocalState(configId, ['newQueries', queryId], newQuery);
        updateLocalState(configId, ['editingQueries', queryId], newQuery);
      } else {
        removeFromLocalState(configId, ['editingQueries', queryId]);
      }
    },

    destinationEdit(configId, queryId) {
      updateLocalState(configId, ['isDestinationEditing', queryId], true);
      if (!getLocalState(configId).get(['isChanged', queryId], false)) {
        updateLocalState(configId, ['isChanged', queryId], true);
      }
    },

    changeQueryEdit(configId, newQuery) {
      const queryId = newQuery.get('id');
      updateLocalState(configId, ['editingQueries', queryId], newQuery);
      if (!getLocalState(configId).getIn(['isChanged', queryId], false)) {
        updateLocalState(configId, ['isChanged', queryId], true);
      }
    },

    saveQueryEdit(configId, queryId) {
      const store = getStore(configId);
      let newQuery = store.getEditingQuery(queryId);
      if (newQuery.get('advancedMode')) {
        newQuery = newQuery.delete('table');
        newQuery = newQuery.delete('columns');
      } else {
        newQuery = newQuery.delete('query');
      }
      newQuery = newQuery.delete('advancedMode');
      newQuery = this.checkTableName(newQuery, store);
      var newQueries, diffMsg;
      if (store.getQueries().find((q) => q.get('id') === newQuery.get('id') )) {
        newQueries = store.getQueries().map((q) => q.get('id') === queryId ? newQuery : q);
        diffMsg = 'Edit query '  + newQuery.get('name');
      } else {
        newQueries = store.getQueries().push(newQuery);
        diffMsg = 'Create query ' + newQuery.get('name');
      }
      const newData = store.configData.setIn(['parameters', 'tables'], newQueries);
      removeFromLocalState(configId, ['isDestinationEditing', queryId]);

      saveConfigData(configId, newData, ['isSaving', queryId], diffMsg).then(() => {
        removeFromLocalState(configId, ['editingQueries', queryId]);
        removeFromLocalState(configId, ['isSaving', queryId]);
        removeFromLocalState(configId, ['isChanged', queryId]);
        if (store.isNewQuery(queryId)) {
          removeFromLocalState(configId, ['newQueries', queryId]);
        }
      });
    },

    quickstart(configId, tableList) {
      const store = getStore(configId);
      let queries = tableList.map(function(table) {
        let query = store.generateNewQuery(null, componentSupportsSimpleSetup(componentId));
        query = query.set('table', table);
        query = query.set('name', table.get('tableName'));
        const pkCols = getPKColumsFromSourceTable(table, store.getSourceTables(configId));
        if (pkCols.count() > 0) {
          query = query.set('primaryKey', pkCols.map((column) => {
            return column.get('name');
          }).toJS());
          query = query.set('incremental', true);
        }
        query = query.set('outputTable', store.getDefaultOutputTableId(table.get('tableName')));
        return query;
      });
      const diffMsg = 'Quickstart config creation';
      const newData = store.configData.setIn(['parameters', 'tables'], queries);
      saveConfigData(configId, newData, ['quickstartSaving'], diffMsg).then(() => {
        removeFromLocalState(configId, ['quickstartSaving']);
      });
    },

    getDefaultOutputTableId(configId, name) {
      const store = getStore(configId);
      return store.getDefaultOutputTableId(name);
    },

    getPKColumnsFromSourceTable(table, sourceTable) {
      return getPKColumsFromSourceTable(table, sourceTable);
    },

    quickstartSelected(configId, selected) {
      updateLocalState(configId, ['quickstart', 'tables'], selected);
    },

    sourceTablesLoaded(configId) {
      const store = getStore(configId);
      return !!store.getSourceTables(configId);
    },

    updateLocalState(configId, path, data) {
      return updateLocalState(configId, path, data);
    },

    getSourceTables(configId) {
      const store = getStore(configId);
      const credentials = store.getCredentials();
      if (store.hasValidCredentials(credentials)) {
        let runData = store.configData.setIn(['parameters', 'tables'], List());
        runData = runData.setIn(['parameters', 'db'], store.getCredentials());
        const params = {
          configData: runData.toJS()
        };
        return callDockerAction(componentId, 'getTables', params).then(function(data) {
          if (data.status === 'error') {
            updateLocalState(configId, storeProvisioning.sourceTablesErrorPath, fromJS(data.message));
          } else if (data.status === 'success') {
            updateLocalState(configId, storeProvisioning.sourceTablesErrorPath, null);
          }
          updateLocalState(configId, storeProvisioning.sourceTablesPath, fromJS(data.tables));
          updateLocalState(configId, storeProvisioning.loadingSourceTablesPath, false);
        });
      }
    }
  };
}
