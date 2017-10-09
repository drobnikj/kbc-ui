import store from '../components/stores/InstalledComponentsStore';
import {List, Map, fromJS} from 'immutable';
import fuzzy from 'fuzzy';
import * as templateFields from './templates/credentials';
import hasSshTunnel from './templates/hasSshTunnel';
import _ from 'underscore';
import string from '../../utils/string';
import getDefaultPort from './templates/defaultPorts';

const defaultSshPort = 22;

export const sourceTablesPath = ['sourceTables', 'data'];
export const sourceTablesErrorPath = ['sourceTables', 'error'];
export const loadingSourceTablesPath = ['sourceTables', 'loading'];

function fetch(componentId, configId) {
  const config = store.getConfigData(componentId, configId) || Map();
  return {
    config: config || Map(),
    parameters: config.get('parameters', Map()),
    localState: store.getLocalState(componentId, configId) || Map()
  };
}

function generateId(existingIds) {
  const randomNumber = () => Math.floor((Math.random() * 100000) + 1);
  let newId = randomNumber();
  while (existingIds.indexOf(newId) >= 0) {
    newId = randomNumber();
  }
  return newId;
}

function isValidQuery(query) {
  const nameValid = query.get('name', '').trim().length > 0;
  const queryValid = query.get('query', '').trim().length > 0;
  const tableValid = (query.get('table')) ? query.get('table').get('tableName', '').trim().length > 0 : false;
  return nameValid && (queryValid || tableValid);
}

export const componentsStore = store;
export function createStore(componentId, configId) {
  const data = fetch(componentId, configId);
  return {
    hasValidCredentials(credentials) {
      const configCredentials = this.getCredentials();
      if (!credentials) {
        return false;
      }
      const hasSSH = hasSshTunnel(componentId);
      const fields = templateFields.getFields(componentId);
      const validGeneralCreds = _.reduce(fields, (memo, field) => {
        const propName = field[1];
        // const type = field[2];
        let value = credentials.get(propName, '');
        if (value) {
          value = value.toString();
        }
        const isProtected = templateFields.getProtectedProperties(componentId).indexOf(propName) > -1;
        const isRequired = templateFields.getRequiredProperties(componentId).indexOf(propName) > -1;
        const alreadySaved = !_.isEmpty(configCredentials.get(propName));
        const isValueValid = !isRequired || !_.isEmpty(value) || (isProtected && alreadySaved);
        return memo && isValueValid;
      }, true);
      const ssh = credentials.get('ssh', Map());
      const sshFields = [
        ['sshHost', 'text'],
        ['user', 'text'],
        ['sshPort', 'number']
      ];
      const isValidSSH = _.reduce(sshFields, (memo, field) => {
        const propName = field[0];
        let value = ssh.get(propName, '');
        if (value) {
          value = value.toString();
        }
        return memo && !_.isEmpty(value);
      }, true);
      const hasKeys = ssh.getIn(['keys', 'public']) && ssh.getIn(['keys', '#private']);
      let sshValid = true;
      if (hasSSH && ssh.get('enabled')) {
        sshValid = hasKeys && isValidSSH;
      }
      return validGeneralCreds && sshValid;
    },

    // Credentials -- start --
    getCredentials() {
      return data.parameters.get('db', Map());
    },

    isEditingCredentials() {
      return !!data.localState.get('editingCredentials');
    },

    isSavingCredentials() {
      return data.localState.get('isSavingCredentials', false);
    },

    getEditingCredentials() {
      return data.localState.get('editingCredentials');
    },

    getNewCredentials() {
      var defaultNewCredentials = data.parameters.get('db', Map());
      if (!defaultNewCredentials.get('port')) {
        defaultNewCredentials = defaultNewCredentials.set('port', getDefaultPort(componentId));
      }
      if (!defaultNewCredentials.getIn(['ssh', 'sshPort'])) {
        defaultNewCredentials = defaultNewCredentials.setIn(['ssh', 'sshPort'], defaultSshPort);
      }

      const result = data.localState.get('newCredentials', defaultNewCredentials);
      if (result) {
        return result;
      } else {
        return defaultNewCredentials;
      }
    },
    // Credentials -- end --

    generateNewQuery(queryId = null) {
      const ids = this.getQueries().map((q) => q.get('id')).toJS();
      const defaultNewQuery = fromJS({
        enabled: true,
        name: '',
        incremental: false,
        outputTable: '',
        table: '',
        columns: [],
        primaryKey: [],
        id: (queryId) ? queryId : generateId(ids)
      });
      data.localState.setIn(['newQueries', defaultNewQuery.get('id')], defaultNewQuery);
      return defaultNewQuery;
    },

    getNewQuery(queryId) {
      return data.localState.getIn(['newQueries', queryId]);
    },

    isEditingQuery(queryId) {
      return !!data.localState.getIn(['editingQueries', queryId]);
    },

    getEditingQuery(queryId) {
      return data.localState.getIn(['editingQueries', queryId]);
    },

    getEditingQueries() {
      return data.localState.getIn(['editingQueries']);
    },

    isSavingQuery(queryId) {
      return !!data.localState.getIn(['isSaving', queryId]);
    },

    isNewQuery(queryID) {
      return !!data.localState.getIn(['newQueries', queryID]);
    },

    isEditingQueryValid(queryId) {
      const query = this.getEditingQuery(queryId);
      if (!query) {
        return false;
      }
      return isValidQuery(query);
    },

    queryNameExists(query) {
      return !!this.getQueries().find((q) => q.get('name') === query.get('name') && q.get('id') !== query.get('id'));
    },

    getDefaultOutputTableId(name) {
      if (name === '') {
        return '';
      }
      const qname = string.sanitizeKbcTableIdString(name);
      const bucketName = string.sanitizeKbcTableIdString(componentId);
      return `in.c-${bucketName}.${qname}`;
    },

    getQueriesPendingActions() {
      return data.localState.getIn(['pending'], Map());
    },

    getQueriesFilter() {
      return data.localState.get('queriesFilter', '');
    },

    // -------- CONFIGDATA manipulation -----------------
    configData: data.config,

    getQueries() {
      return data.parameters.get('tables', List()).map((q) => {
        let pk = q.get('primaryKey', null);
        if (_.isEmpty(pk) || _.isString(pk)) {
          pk = List();
        }
        return q.set('primaryKey', pk);
      });
    },

    getQueriesFiltered() {
      const q = this.getQueriesFilter();
      return this.getQueries().filter( (query) => {
        return fuzzy.match(q, query.get('name')) ||
          fuzzy.match(q, query.get('outputTable'));
      }).sortBy((query) => query.get('name').toLowerCase());
    },

    getConfigQuery(qid) {
      if (this.isEditingQuery(qid)) {
        return this.getEditingQuery(qid);
      } else if (this.isNewQuery(qid)) {
        return this.getNewQuery(qid);
      }
      let query = this.getQueries().find((q) => q.get('id') === qid ) || this.generateNewQuery(qid);
      if (query.has('query')) {
        query = query.set('advancedMode', true);
      } else {
        query = query.set('advancedMode', false);
      }
      return query;
    },

    getQueryName(qid) {
      return this.getConfigQuery(qid).get('name');
    },

    getSourceTables() {
      return data.localState.getIn(sourceTablesPath);
    },

    getSourceTablesLoading() {
      return !!data.localState.getIn(loadingSourceTablesPath);
    },

    getQuickstartTables() {
      return data.localState.getIn(['quickstart', 'tables']);
    },

    getLocalState() {
      return fetch(componentId, configId).localState;
    }
  };
}
