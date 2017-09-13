import React from 'react';
import {Map, fromJS} from 'immutable';
import storageTablesStore from '../../stores/StorageTablesStore';
import MetadataStore from '../../stores/MetadataStore';
import storageActionCreators from '../../StorageActionCreators';
// import {Loader} from 'kbc-react-components';
import Select from 'react-select';
import createStoreMixin from  '../../../../react/mixins/createStoreMixin';
import ComponentsStore from '../../stores/ComponentsStore';
// import validateStorageTableId from  '../../../../utils/validateStorageTableId';
import InstalledComponentStore from '../../stores/InstalledComponentsStore';

export default  React.createClass({
  mixins: [createStoreMixin(storageTablesStore, MetadataStore, ComponentsStore, InstalledComponentStore)],
  propTypes: {
    onSelectTableFn: React.PropTypes.func.isRequired,
    placeholder: React.PropTypes.string.isRequired,
    value: React.PropTypes.string.isRequired,
    excludeTableFn: React.PropTypes.func,
    allowedBuckets: React.PropTypes.array,
    disabled: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      excludeTableFn: () => false,
      allowedBuckets: ['in', 'out'],
      disabled: false
    };
  },

  getStateFromStores() {
    const isTablesLoading = storageTablesStore.getIsLoading();
    const tables = storageTablesStore.getAll();
    const metadataGroupedTables = MetadataStore.getTablesByInstalledComponents();
    const components = ComponentsStore.getAll();
    const parsedTables = this.groupTablesByMetadata(tables, InstalledComponentStore.getConfig, components, metadataGroupedTables);
    return {
      isTablesLoading: isTablesLoading,
      tables: tables,
      parsedTablesMap: parsedTables
    };
  },

  componentDidMount() {
    setTimeout( () => storageActionCreators.loadTables());
  },

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.value !== this.props.value ||
           nextState.isTablesLoading !== this.state.isTablesLoading;
  },

  onSelectTable(selectedOption) {
    const tableId = selectedOption.value;
    const table = this.state.tables.find(t => t.get('id') === tableId);
    return this.props.onSelectTableFn(tableId, table);
  },

  render() {
    return (
      <Select
        disabled={this.props.disabled}
        name="source"
        clearable={false}
        value={this.props.value}
        isLoading={this.state.isTablesLoading}
        placeholder={this.props.placeholder}
        valueRenderer={this.valueRenderer}
        optionRenderer={this.optionRenderer}
        filterOption={this.filterOption}
        onChange={this.onSelectTable}
        options={this.transformOptionsMap()}
      />
    );
  },

  tableExist(tableId) {
    return this.state.tables.find((t) => tableId === t.get('id'));
  },

  filterOption(op, filter) {
    if (!filter) return true;
    const compareFn = (what) => what.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    const {parsedTablesMap} = this.state;
    const parentTables = op.isParent ? parsedTablesMap.find((v, key) => key.get('label') === op.value) : null;
    const isNestedMatch = parentTables && parentTables.find(t => compareFn(t.value));
    return isNestedMatch || compareFn(op.label) || compareFn(op.value) || (op.parent && compareFn(op.parent.label));
  },

  optionRenderer(op) {
    if (op.isParent) {
      return <strong style={{color: '#000'}}>{op.label}</strong>;
    }
    let value = op.label;
    if (!this.tableExist(op.value)) value = <span className="text-muted">{op.label}</span>;
    return <div style={{paddingLeft: 20}}>{value}</div>;
  },

  valueRenderer(op) {
    if (op.isUnknownSource) {
      return op.value;
    } else {
      return `${op.parent.label} / ${op.label}`;
    }
  },

  groupTablesByMetadata(tables, getConfigFn, components, tablesByComponentAndConfig) {
    const allTables = this._getTables(tables);
    const allTablesIds = allTables.map(t => t.value);
    const groups = tablesByComponentAndConfig.reduce((memo, tablesIds, key) => {
      const filteredTablesIds = tablesIds.filter(tid => allTablesIds.includes(tid));
      if (filteredTablesIds.count() === 0) return memo;
      const componentId = key.get('componentId');
      const component = components.get(componentId);
      const componentName = component ? `${component.get('name')} ${component.get('type')}` : componentId;
      const configId = key.get('configId');
      const config = getConfigFn(componentId, configId);
      const configName = config.count() > 0 ? config.get('name') : configId;
      const isUnknownSource = !component;
      const tableNames = filteredTablesIds.sort().map(tid => {
        const tableName = isUnknownSource ? tid : tables.getIn([tid, 'name']);
        return {label: tableName, value: tid, isUnknownSource};
      });
      return memo.set(fromJS({label: `${componentName} / ${configName}`, config: config}), tableNames);
    }, Map());
    const sortedGroups = groups.sortBy((value, key) => key.get('label'));
    return sortedGroups;
  },

  _getTables(allTables) {
    let tables = allTables;
    tables = tables.filter((table) => {
      const stage = table.get('bucket').get('stage');
      const excludeTable = this.props.excludeTableFn(table.get('id'), table);
      return this.props.allowedBuckets.includes(stage) && !excludeTable;
    });
    tables = tables.sort((a, b) => a.get('id').localeCompare(b.get('id')));
    tables = tables.map((table) => {
      const tableId = table.get('id');
      return {
        label: tableId,
        value: tableId
      };
    });
    const result = tables.toList().toJS();
    const hasValue = result.find((t) => t.value === this.props.value);
    if (!!this.props.value && !hasValue) {
      return result.concat({label: this.props.value, value: this.props.value});
    } else {
      return result;
    }
  },

  transformOptionsMap() {
    const option = (value, label, config, disabled = false, parent = null, isUnknownSource = false) => ({value, label, disabled, isParent: disabled, parent, isUnknownSource, config});
    return this.state.parsedTablesMap.reduce((acc, tables, component) => {
      const componentName = component.get('label');
      const parent = option(componentName, componentName, component.get('config').toJS(), true);
      const children = tables.toJS().map(c => option(c.value, c.label, null, false, parent, c.isUnknownSource));
      return acc.concat(parent).concat(children);
    }, []);
  }
});
