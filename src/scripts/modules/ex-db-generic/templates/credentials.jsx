// define as [labelValue, propName, type = 'text', isProtected = false, isRequired = false]

const defaultFields = [
  ['Host Name', 'host', 'text', false, true],
  ['Port', 'port', 'number', false, true],
  ['Username', 'user', 'text', false, true],
  ['Password', '#password', 'password', true, true],
  ['Database', 'database', 'text', false, true]
];

/*
# impala fields:
# host: impala
# port: 21050
# database: default
# user: impala
# password:
# auth_mech: 0
*/

const firebirdFields = [
  ['Database', 'dbname', 'text', false, true],
  ['Username', 'user', 'text', false, true],
  ['Password', '#password', 'password', true, true]
];

const oracleFields = [
  ['Host Name', 'host', 'text', false, true],
  ['Port', 'port', 'number', false, true],
  ['Username', 'user', 'text', false, true],
  ['Password', '#password', 'password', true, true],
  ['Service Name/SID', 'database', 'text', false, true]
];

const snowflakeFields = [
  ['Host Name', 'host', 'text', false, true],
  ['Port', 'port', 'number', false, true],
  ['Username', 'user', 'text', false, true],
  ['Password', '#password', 'password', true, true],
  ['Database', 'database', 'text', false, true],
  ['Schema', 'schema', 'text', false, true],
  ['Warehouse', 'warehouse', 'text', false, false]
];

const COMPONENTS_FIELDS = {
  'keboola.ex-db-pgsql': defaultFields,
  'keboola.ex-db-redshift': defaultFields,
  'keboola.ex-db-db2': defaultFields,
  'keboola.ex-db-firebird': firebirdFields,
  'keboola.ex-db-impala': defaultFields,
  'keboola.ex-db-oracle': oracleFields,
  'keboola.ex-mongodb': defaultFields,
  'keboola.ex-db-snowflake': snowflakeFields
};


export function getFields(componentId) {
  if (COMPONENTS_FIELDS[componentId]) {
    return COMPONENTS_FIELDS[componentId];
  } else {
    return defaultFields;
  }
}

// returns @array of properties that needs to be hashed
// should return only password property in most cases
export function getProtectedProperties(componentId) {
  var result = [];
  let fields = this.getFields(componentId);
  fields.forEach(function(f) {
    let isProtected = f[3];
    let propName = f[1];
    if (isProtected) {
      result.push(propName);
    }
  });
  return result;
}

// returns @array of properties that cannot be empty
export function getRequiredProperties(componentId) {
  var result = [];
  let fields = this.getFields(componentId);
  fields.forEach(function(f) {
    let isRequired = f[4];
    let propName = f[1];
    if (isRequired) {
      result.push(propName);
    }
  });
  return result;
}
