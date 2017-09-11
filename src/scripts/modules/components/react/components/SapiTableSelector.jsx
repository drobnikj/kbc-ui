import React from 'react';
import storageTablesStore from '../../stores/StorageTablesStore';
import MetadataStore from '../../stores/MetadataStore';
import storageActionCreators from '../../StorageActionCreators';
// import {Loader} from 'kbc-react-components';
import Select from 'react-select';
import createStoreMixin from  '../../../../react/mixins/createStoreMixin';
// import validateStorageTableId from  '../../../../utils/validateStorageTableId';

export default  React.createClass({
  mixins: [createStoreMixin(storageTablesStore, MetadataStore)],
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
        options={this._getTables()}
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
