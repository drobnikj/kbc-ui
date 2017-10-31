// by default all components have ssh tunnel, if some component dont
// put it here:
const componentsNotWithSsh = [
  'keboola.ex-db-snowflake',
  'keboola.ex-db-firebird'
];

export default function(componentId) {
  return !(componentsNotWithSsh.indexOf(componentId) >= 0);
}
