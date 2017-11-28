import {Map, List} from 'immutable';
export const OAUTH_V2_WRITERS = ['keboola.wr-dropbox-v2', 'keboola.wr-google-drive'];
export function getTdeFileName(configData, tableId) {
  const name = configData.getIn(['parameters', 'tables', tableId, 'tdename']);
  return name || `${tableId}.tde`;
}

export function getEditingTdeFileName(configData, localState, tableId) {
  const defaultName = getTdeFileName(configData, tableId);
  const editing = localState.getIn(['editingTdeNames', tableId]);
  const result = editing || defaultName;
  return result.trim();
}

// webalize name to be same as the one generated by kbc
export function webalizeTdeFileName(name) {
  return name.replace(/[^a-zA-Z0-9\_\.]/g, '_').replace(/_+/, '_');
}


export function getTableMapping(configData, tableId) {
  const tables = configData.getIn(['storage', 'input', 'tables'], List());
  return tables.find( (t) => t.get('source') === tableId) || Map({source: tableId});
}

export function getEditingTableMapping(configData, localState, tableId) {
  const defaultMapping = getTableMapping(configData, tableId) || Map();
  const editing = localState.getIn(['editingMappings', tableId]);
  const result = editing || defaultMapping;
  return result;
}

export function assertTdeFileName(name) {
  // check for 150 len
  if (name.length > 150) {
    return 'Must be less than 150 characters long';
  }
  // // check for regex
  // const REGEX = new RegExp('^[a-zA-Z_0-9.]+$');
  // if (REGEX.test(name) === false) {
  //   return 'Can only contain alphanumeric characters, underscore and dot.';
  // }

  // check for tde extension
  if (name.endsWith('.tde') === false) {
    return 'Must end with proper extension, ie .tde';
  }
  return null;
}
