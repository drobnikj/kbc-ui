import React from 'react';
import {Map} from 'immutable';
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
    return {
      tablesByComponentAndConfig: MetadataStore.groupTablesByComponentAndConfig(),
      components: ComponentsStore.getAll(),
      getConfigFn: InstalledComponentStore.getConfig,
      isTablesLoading: isTablesLoading,
      tables: tables,
      tablesByComponent: MetadataStore.groupTablesByMetadataValue('KBC.lastUpdatedBy.component.id'),
      tablesByConfig: MetadataStore.groupTablesByMetadataValue('KBC.lastUpdatedBy.configuration.id')
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
        optionRenderer={this.valueRenderer}
        onChange={this.onSelectTable}
        options={this.generateOptions()}
      />
    );
  },

  tableExist(tableId) {
    return this.state.tables.find((t) => tableId === t.get('id'));
  },

  valueRenderer(op) {
    if (this.tableExist(op.value)) {
      return op.label;
    } else {
      return <span className="text-muted">{op.label} </span>;
    }
  },

  generateOptions() {
    const allTables = this._getTables();
    const allTablesIds = allTables.map(t => t.value);
    const {tables, getConfigFn, components, tablesByComponentAndConfig} = this.state;
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
      const tableNames = filteredTablesIds.map(tid => {
        const tableName = isUnknownSource ? tid : tables.getIn([tid, 'name']);
        return {label: tableName, value: tid};
      });
      return memo.set(`${componentName} / ${configName}`, tableNames);
    }, Map());

    return this.transformOptions(groups);
  },

  _getTables() {
    let tables = this.state.tables;
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

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({value, label, render, disabled});

    return options.reduce((acc, tables, componentName) => {
      const parent = option(componentName, componentName, (<strong style={{color: '#000'}}>{componentName}</strong>), true);
      const children = tables.toJS().map(c => option(c.value, c.label, <div style={{paddingLeft: 10}}>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  }
});
