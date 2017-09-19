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
import ComponentIcon from '../../../../react/common/ComponentIcon';
import fuzzy from 'fuzzy';
import ApplicationStore from '../../../../stores/ApplicationStore';
const PREVIEW_FEATURE = 'table-selector-ex';
const BEGIN_MATCH = '%%%_';
const END_MATCH = '_%%%';
export default  React.createClass({
  mixins: [createStoreMixin(storageTablesStore, MetadataStore, ComponentsStore, InstalledComponentStore, ApplicationStore)],
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
    const parsedTables = this.mapTablesMetadataToConfigs(tables, InstalledComponentStore.getConfig, components, metadataGroupedTables);
    return {
      hasMetadataFeature: ApplicationStore.hasCurrentAdminFeature(PREVIEW_FEATURE),
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
    const isNew = this.state.hasMetadataFeature;
    const enhancedProps = isNew ? {
      valueRenderer: this.valueRenderer,
      optionRenderer: this.optionRenderer,
      filterOption: this.filterOption,
      filterOptions: this.filterOptions
    } : {};
    return (
      <Select
        disabled={this.props.disabled}
        name="source"
        clearable={false}
        value={this.props.value}
        isLoading={this.state.isTablesLoading}
        placeholder={this.props.placeholder}
        {...enhancedProps}
        onChange={this.onSelectTable}
        options={isNew ? this.prepareOptions() : this._getTables(this.state.tables)}
      />
    );
  },

  tableExist(tableId) {
    return this.state.tables.find((t) => tableId === t.get('id'));
  },

  filterOption(op, filter) {
    if (!filter) return true;
    const compareFn = (groupName, tableLabel) => fuzzy.match(filter, `${groupName} ${tableLabel}`);  // what.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
    if (op.isParent) {
      return op.childrenOptions.find(t => compareFn(op.groupName, t.tableLabel));
    } else {
      return compareFn(op.groupName, op.tableLabel);
    }
  },

  extractFilterValue(op) {
    if (!op.component) return op.isParent ? op.groupName : op.tableLabel;
    if (op.isParent) return op.groupName;
    return `${op.groupName} ${op.tableLabel}`;
  },
  // filterMatchedOption(op, matchedOptions, )
  filterOptions(options, filter) {
    if (!filter) {
      return options.map(o => {
        o.matched = null;
        return o;
      });
    }
    const filterSettings = {
      pre: BEGIN_MATCH,
      post: END_MATCH,
      extract: this.extractFilterValue};
    const matched = fuzzy.filter(filter, options, filterSettings);
    // mutating options object!!
    const newOptions = options.map((o, idx) => {
      const matchedOption = matched.find(m => m.index === idx);
      if (matchedOption) {
        o.matched = matchedOption;
      } else {
        o.matched = null;
      }
      return o;
    });
    const results = newOptions.filter(o => {
      if (!o.isParent) return !!o.matched;
      return o.childrenOptions.reduce((memo, cop) => memo || matched.find(m => m.original.table && m.original.table.id === cop.table.id), false);
    });
    return results;
  },

  renderMatchedOptionParts(parts) {
    const SIMPLE = 0;
    return parts.map(e => e.type === SIMPLE ? <span>{e.value}</span> : <u>{e.value}</u>);
  },

  parseMatchedOption(matched, parentName) {
    const splitRegex = new RegExp(`(${BEGIN_MATCH})|(${END_MATCH})`);
    const strArray = matched.string.split(splitRegex);
    const SIMPLE = 0;
    const UNDERLINED = 1;
    let parsingState = SIMPLE;
    const elements = strArray.reduce((memo, token) => {
      if (token === BEGIN_MATCH) {
        parsingState = UNDERLINED;
        return memo;
      }
      if (token === END_MATCH) {
        parsingState = SIMPLE;
        return memo;
      }
      memo.push({type: parsingState, value: token});
      return memo;
    }, []).filter(e => e.value);
    const groups = elements.reduce((memo, el) => {
      const newValue = `${memo.value}${el.value}`;
      const lastValue = memo.value;

      if (parentName && parentName.indexOf(newValue) === 0) {
        memo.value = newValue;
        memo.parentGroup.push(el);
        return memo;
      }
      if (parentName && parentName.indexOf(lastValue) === 0 && lastValue !== parentName) {
        const lastPart = parentName.slice(lastValue.length);
        memo.parentGroup.push({type: el.type, value: lastPart});
        const firstPart = el.value.slice(lastPart.length);
        memo.tableGroup.push({type: el.type, value: firstPart});
        memo.value = parentName;
        return memo;
      }
      memo.tableGroup.push(el);
      return memo;
    }, {parentGroup: [], tableGroup: [], value: ''});

    return (
      <span>
        {groups.parentGroup.length > 0 &&
          <small>
            {this.renderMatchedOptionParts(groups.parentGroup)}
            {' '}/{' '}
          </small>
        }
        <span>{this.renderMatchedOptionParts(groups.tableGroup)}</span>
      </span>
    );
  },

  optionRenderer(op) {
    if (op.isParent) {
      const groupName = op.matched ? this.parseMatchedOption(op.matched) : op.groupName;
      return (
        <strong style={{color: '#000'}}>
          <ComponentIcon component={fromJS(op.component)}/>{groupName}
        </strong>
      );
    }
    const value = op.matched ? this.parseMatchedOption(op.matched, op.groupName) : op.tableLabel;
    if (!this.tableExist(op.table.id)) {
      return <span className="text-muted">{value}</span>;
    } else {
      return <div style={{paddingLeft: 20}}>{value}</div>;
    }
  },

  valueRenderer(op) {
    return <span><ComponentIcon component={fromJS(op.component)}/> {op.groupName} / {op.tableLabel}</span>;
  },

  mapTablesMetadataToConfigs(storageTables, getConfigFn, components, tablesByComponentAndConfig) {
    const allTables = this._getTables(storageTables);
    const allTablesIds = allTables.map(t => t.value);
    const groups = tablesByComponentAndConfig.reduce((memo, grouTables, key) => {
      const filteredTables = grouTables.filter(t => allTablesIds.includes(t.get('id')));
      if (filteredTables.count() === 0) return memo;
      const componentId = key.get('componentId');
      const component = components.get(componentId);
      const configId = key.get('configId');
      const parsedConfig = component ? getConfigFn(componentId, configId) : null;
      const config = parsedConfig && parsedConfig.count() === 0 ? Map({id: configId, name: configId}) : parsedConfig;
      const groupKey = fromJS({config: config, component: component});
      return memo.set(groupKey, filteredTables);
    }, Map()).sortBy((value, groupInfo) => {
      const jsComponent = groupInfo.get('component') ? groupInfo.get('component').toJS() : null;
      const jsConfig = groupInfo.get('config') ? groupInfo.get('config').toJS() : null;
      return this.composeGroupName(jsComponent, jsConfig);
    });

    return groups;
  },

  composeGroupName(jsComponent, jsConfig) {
    const componentType = jsComponent && jsComponent.type !== 'transformation' ? ` ${jsComponent.type}` : '';
    const componentName = jsComponent ? `${jsComponent.name}${componentType}` : 'Unknown component';
    const configName = jsConfig ? jsConfig.name : 'Unknown config';
    return `${componentName} / ${configName}`;
  },

  makeOption(component, config, childrenOptions, table = null) {
    const groupName = this.composeGroupName(component, config);
    const isTableOption = !!table;
    const value = isTableOption ? table.id : null;
    let tableLabel = null;
    if (isTableOption) tableLabel = component ? table.name : table.id;
    return {component, groupName, config, childrenOptions, table, disabled: !isTableOption, isParent: !isTableOption, value, tableLabel};
  },

  prepareOptions() {
    return this.state.parsedTablesMap.reduce((acc, tables, groupInfo) => {
      // const componentName = groupInfo.get('label');
      const jsComponent = groupInfo.get('component') ? groupInfo.get('component').toJS() : null;
      const jsConfig = groupInfo.get('config') ? groupInfo.get('config').toJS() : null;
      const jsTables = tables.toJS();
      const children = jsTables.map(table => this.makeOption(jsComponent, jsConfig, null, table));
      const parent = this.makeOption(jsComponent, jsConfig, children);
      return acc.concat(parent).concat(children);
    }, []);
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
  }

});
