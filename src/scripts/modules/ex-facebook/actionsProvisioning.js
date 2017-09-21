import storeProvisioning from './storeProvisioning';
import _ from 'underscore';
import {fromJS} from 'immutable';
import componentsActions from '../components/InstalledComponentsActionCreators';
import callDockerAction from '../components/DockerActionsApi';
import accountDescriptionTemplate from './templates/accountDescription';

// PROPTYPES HELPER:
/*
  localState: PropTypes.object.isRequired,
  updateLocalState: PropTypes.func.isRequired,
  prepareLocalState: PropTypes.func.isRequired
*/

export default function(COMPONENT_ID, configId) {
  const store = storeProvisioning(COMPONENT_ID, configId);
  const getAccountDesc = accountDescriptionTemplate(COMPONENT_ID);

  function updateLocalState(path, data) {
    const ls = store.getLocalState();
    const newLocalState = ls.setIn([].concat(path), data);
    componentsActions.updateLocalState(COMPONENT_ID, configId, newLocalState, path);
  }

  function presetVersion(data) {
    const path = ['parameters', 'api-version'];
    const defaultVersion = store.DEFAULT_API_VERSION;
    const version = data.getIn(path, defaultVersion) || defaultVersion;
    return data.setIn(path, version);
  }

  function saveConfigData(data, waitingPath, changeDescription) {
    let dataToSave = presetVersion(data);
    updateLocalState(waitingPath, true);
    return componentsActions.saveComponentConfigData(COMPONENT_ID, configId, dataToSave, changeDescription)
      .then(() => updateLocalState(waitingPath, false));
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

  function generateId() {
    const existingIds = store.queries.map((q) => q.get('id'));
    const randomNumber = () => Math.floor((Math.random() * 100000) + 1);
    let newId = randomNumber();
    while (existingIds.indexOf(newId) >= 0) {
      newId = randomNumber();
    }
    return newId;
  }

  function touchQuery() {
    return fromJS({
      'id': generateId(),
      'type': 'nested-query',
      'name': '',
      'query': {
        'path': '',
        'fields': '',
        'ids': '',
        'limit': '25'
      }
    });
  }

  function saveAccounts(newAccounts) {
    const msg = 'Update selected ' + getAccountDesc('pages');
    const data = store.configData.setIn(['parameters', 'accounts'], newAccounts);
    return saveConfigData(data, store.accountsSavingPath, msg);
  }

  function saveQueries(newQueries, savingPath, changeDescription) {
    const msg = changeDescription || 'Update queries';
    const data = store.configData.setIn(['parameters', 'queries'], newQueries);
    return saveConfigData(data, savingPath, msg);
  }

  function saveQuery(query, changeDescription, savingPath) {
    const qid = query.get('id');
    let found = false;
    let action = 'Update query';
    let newQueries = store.queries.map((q) => {
      if (q.get('id') === qid) {
        found = true;
        return query;
      } else {
        return q;
      }
    });
    if (!found) {
      action = 'Add query';
      newQueries = newQueries.push(query);
    }
    return saveQueries(newQueries, savingPath || store.getSavingQueryPath(qid), changeDescription || `${action} ${query.get('name')}`);
  }

  function toggleQueryEnabledFn(qid) {
    const query = store.findQuery(qid);
    const disabled = query.get('disabled');
    const action = disabled ? 'Enable query' : 'Disable query';
    const desc = `${action} ${query.get('name')}`;
    return saveQuery(query.set('disabled', !disabled), desc, store.getPendingPath(['toggle', qid]));
  }

  function deleteQuery(query) {
    const qid = query.get('id');
    const newQueries = store.queries.filter((q) => q.get('id') !== qid);
    const desc = `Remove query ${query.get('name')}`;
    return saveQueries(newQueries, store.getPendingPath(['delete', qid]), desc);
  }

  function startEditing(what, initValue = null) {
    const path = store.getEditPath(what);
    updateLocalState(path, initValue);
  }

  function updateEditing(what, value) {
    const path = store.getEditPath(what);
    updateLocalState(path, value);
  }

  function cancelEditing(what) {
    const data = store.editData.delete(what);
    updateLocalState(store.getEditPath(null), data);
  }

  function saveApiVersion(newVersion) {
    // const newVersion = store.editData.get('version');
    const msg = 'Update facebook api version';
    const data = store.configData.setIn(['parameters', 'api-version'], newVersion);
    const savingPath = store.getPendingPath('version');
    return saveConfigData(data, savingPath, msg).then(() => cancelEditing('version'));
  }

  return {
    saveApiVersion: saveApiVersion,
    updateEditing: updateEditing,
    startEditing: startEditing,
    cancelEditing: cancelEditing,
    deleteQuery: deleteQuery,
    saveQuery: saveQuery,
    prepareLocalState: prepareLocalState,
    updateLocalState: updateLocalState,
    saveQueries: saveQueries,
    generateId: generateId,
    saveAccounts: saveAccounts,
    touchQuery: touchQuery,
    toggleQueryEnabledFn: toggleQueryEnabledFn,
    loadAccounts() {
      if (!store.isAuthorized()) return null;
      if ((store.syncAccounts.get('data') && !store.syncAccounts.get('isError')) || store.syncAccounts.get('isLoading')) return null;
      const path = store.syncAccountsPath;
      const data = presetVersion(store.configData);
      const params = {
        configData: data.toJS()
      };
      updateLocalState(path.concat('isLoading'), true);
      let actionName = 'accounts';
      if (COMPONENT_ID === 'keboola.ex-facebook-ads') actionName = 'adaccounts';
      return callDockerAction(COMPONENT_ID, actionName, params)
        .then((response) => {
          const isError = response.code >= 400;
          return updateLocalState(path, fromJS({
            isLoading: false,
            code: response.code,
            isError: isError,
            error: isError ? response.error : null,
            data: !isError ? response.map((a) => {delete a.perms; return a;}) : null
          }));
        })
        .catch((error) =>
               updateLocalState(path, fromJS({
                 isLoading: false,
                 isError: true,
                 error: error,
                 data: []
               })));
    }
  };
}
