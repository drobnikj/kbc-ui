
import React from 'react';
import Immutable from 'immutable';
import _ from 'underscore';
import {Loader} from 'kbc-react-components';
import {CodeEditor} from '../../../../react/common/common';
import Select from '../../../../react/common/Select';
import TableSelectorForm from '../../../../react/common/TableSelectorForm';

import SourceTablesError from './SourceTablesError';

import editorMode from '../../templates/editorMode';

export default React.createClass({
  displayName: 'ExDbQueryEditor',
  propTypes: {
    query: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    showSimple: React.PropTypes.bool.isRequired,
    disabled: React.PropTypes.bool,
    configId: React.PropTypes.string.isRequired,
    getDefaultOutputTable: React.PropTypes.func.isRequired,
    componentId: React.PropTypes.string.isRequired,
    isLoadingSourceTables: React.PropTypes.bool.isRequired,
    sourceTables: React.PropTypes.object.isRequired,
    sourceTablesError: React.PropTypes.string,
    destinationEditing: React.PropTypes.bool.isRequired,
    onDestinationEdit: React.PropTypes.func.isRequired,
    getPKColumns: React.PropTypes.func.isRequired,
    queryNameExists: React.PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },

  isExistingTable() {
    const destinationTable = this.props.query.get('outputTable');
    if (!destinationTable || destinationTable === '') {
      return false;
    }
    return this.props.tables.has(destinationTable);
  },

  handleToggleUseQueryEditor(e) {
    let pk = [];
    if (e.target.checked) {
      this.setState({
        simplePk: this.props.query.get('primaryKey')
      });
      pk = this.state.advancedPk || [];
    } else {
      this.setState({
        advancedPk: this.props.query.get('primaryKey')
      });
      pk = this.state.simplePk || [];
    }

    let immutable = this.props.query.withMutations(function(mapping) {
      let query = mapping.set('advancedMode', e.target.checked);
      query = query.set('primaryKey', pk);
      return query;
    }, e);
    return this.props.onChange(immutable);
  },

  handleDestinationChange(newValue) {
    return this.props.onChange(this.props.query.set('outputTable', newValue));
  },

  onDestinationEdit() {
    const query = this.props.query;
    this.props.onChange(query);
    this.props.onDestinationEdit(this.props.configId, this.props.query.get('id'));
  },

  primaryKeyOptions() {
    return this.getColumnsOptions();
  },

  primaryKeyPlaceholder() {
    if (this.isExistingTable()) {
      return 'Cannot add a column';
    }
    return 'Add a column';
  },

  handlePrimaryKeyChange(newValue) {
    if (!this.props.query.get('advancedMode')) {
      this.setState({
        simplePk: newValue
      });
    }
    return this.props.onChange(this.props.query.set('primaryKey', newValue));
  },

  handleIncrementalChange(event) {
    return this.props.onChange(this.props.query.set('incremental', event.target.checked));
  },

  handleQueryChange(data) {
    return this.props.onChange(this.props.query.set('query', data.value));
  },

  handleNameChange(event) {
    const currentOutputTable = this.props.query.get('outputTable');
    const oldDefaultTableValue = this.props.getDefaultOutputTable(this.props.query.get('name'));
    return this.props.onChange(
      this.props.query
        .set('name', event.target.value)
        .set('outputTable', (currentOutputTable && currentOutputTable !== oldDefaultTableValue) ? currentOutputTable : this.props.getDefaultOutputTable(event.target.name))
    );
  },

  sourceTableSelectOptions() {
    if (this.props.sourceTables && this.props.sourceTables.count() > 0) {
      const groupedTables = this.props.sourceTables.groupBy(table => table.get('schema'));
      return groupedTables.keySeq().map(function(group) {
        return {
          value: group,
          label: group,
          children: groupedTables.get(group).map(function(table) {
            return {
              value: {
                schema: table.get('schema'),
                tableName: table.get('name')
              },
              label: table.get('name')
            };
          }).toJS()
        };
      });
    } else {
      return [];
    }
  },

  tableSelectOptions() {
    return this.props.tables.map(function(table) {
      return table.get('id');
    }).sortBy(function(val) {
      return val;
    });
  },

  getPksOnSourceTableChange(newValue) {
    const pkCols = this.props.getPKColumns(Immutable.fromJS(newValue), this.props.sourceTables);
    return pkCols.map((column) => {
      return column.get('name');
    }).toJS();
  },

  handleSourceTableChange(newValue) {
    const currentName = this.props.query.get('name');
    const oldTableName = this.props.query.getIn(['table', 'tableName'], '');
    const newName = (currentName && currentName !== oldTableName) ? currentName : newValue.tableName;
    const currentOutputTable = this.props.query.get('outputTable');
    const oldDefaultOutputTable = this.props.getDefaultOutputTable(oldTableName);
    const defaultOutputTable = this.props.getDefaultOutputTable(newValue.tableName);
    const newOutputTable = (currentOutputTable && currentOutputTable !== oldDefaultOutputTable) ? currentOutputTable : defaultOutputTable;
    const primaryKeys = this.getPksOnSourceTableChange(newValue);
    return this.props.onChange(
      this.props.query
        .set('table', Immutable.fromJS(newValue))
        .set('name', newName)
        .set('primaryKey', primaryKeys)
        .set('incremental', !!primaryKeys)
        .set('outputTable', newOutputTable)
    );
  },

  getColumnsOptions() {
    var columns = [];
    if (this.props.query.get('table')) {
      if (this.props.sourceTables && this.props.sourceTables.count() > 0) {
        var matchedTable = this.props.sourceTables.find((table) =>
          table.get('schema') === this.props.query.get('table').get('schema')
          && table.get('name') === this.props.query.get('table').get('tableName')
        );
        if (!matchedTable) {
          return [];
        }
        columns = matchedTable.get('columns', Immutable.List()).toJS();
      } else {
        return [];
      }
    } else {
      return [];
    }

    return _.map(columns, function(column) {
      return {
        label: column.name,
        value: column.name
      };
    });
  },

  handleChangeColumns(newValue) {
    let query = this.props.query.set('columns', newValue);
    return this.props.onChange(query);
  },

  getQuery() {
    return this.props.query.get('query');
  },

  getTableValue() {
    if (this.props.query.get('table')) {
      return this.props.query.get('table').get('tableName');
    } else return '';
  },

  getTableLabel() {
    if (this.props.query.get('table')) {
      return this.props.query.get('table').get('name');
    } else return '';
  },

  getOutputTableValue() {
    if (this.props.query.get('outputTable') !== '') {
      return this.props.query.get('outputTable');
    } else {
      return this.props.getDefaultOutputTable(this.props.query.get('name'));
    }
  },

  render() {
    return (
      <div className="row">
        <div className="form-horizontal">
          <SourceTablesError
            componentId={this.props.componentId}
            configId={this.props.configId}
            sourceTablesLoading={this.props.isLoadingSourceTables}
            sourceTablesError={this.props.sourceTablesError}
          />
          {this.renderSimpleTable()}
          {this.renderSimpleColumns()}
          <div className="form-group">
            <label className="col-md-3 control-label">Primary Key</label>
            <div className="col-md-9">
              <Select
                name="primaryKey"
                value={this.props.query.get('primaryKey')}
                multi={true}
                disabled={this.props.disabled || this.isExistingTable()}
                allowCreate={true}
                delimiter=","
                placeholder={this.primaryKeyPlaceholder()}
                emptyStrings={false}
                onChange={this.handlePrimaryKeyChange}
                options={this.primaryKeyOptions()}
                promptTextCreator={(label) => (label) ? 'Add column "' + label + '" as primary key' : ''}
              />
            </div>
          </div>
          <div className={(this.props.queryNameExists) ? 'form-group has-error' : 'form-group'}>
            <label className="col-md-3 control-label">Name</label>
            <div className="col-md-9">
              <input
                className="form-control"
                type="text"
                value={this.props.query.get('name')}
                ref="queryName"
                placeholder="e.g. Untitled Query"
                disabled={this.props.disabled}
                onChange={this.handleNameChange}
              />
              {(this.props.queryNameExists) ? <div className="help-block">This name already exists</div> : null}
            </div>
          </div>
          <div>
            <TableSelectorForm
              labelClassName="col-md-3"
              wrapperClassName="col-md-9"
              value={this.getOutputTableValue()}
              onChange={this.handleDestinationChange}
              disabled={this.props.disabled}
              label="Destination"
              help="Where the table will be imported.
                    If the table or bucket does not exist, it will be created.
                    If left empty, the default value will be used"
              onEdit={this.onDestinationEdit}
              editing={this.props.destinationEditing}
            />
          </div>
          <div className="form-group">
            <div className="col-md-9 col-md-offset-3 checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.query.get('incremental')}
                  onChange={this.handleIncrementalChange}
                  disabled={this.props.disabled}
                />
                Incremental Load
              </label>
              <span className="help-block">
                If incremental load is turned on, the table will be updated instead of rewritten.
                Tables with primary keys will update rows, tables without primary keys will append rows.
              </span>
            </div>
          </div>
          {this.renderQueryToggle()}
          <div className="form-group">
            {this.renderQueryEditor()}
          </div>
        </div>
      </div>
    );
  },

  renderQueryToggle() {
    if (this.props.showSimple) {
      return (
        <div className="form-group">
          <div className="col-md-9 col-md-offset-3 checkbox">
            <label>
              <input
                standalone={true}
                type="checkbox"
                label="Use query editor"
                checked={!!this.props.query.get('advancedMode')}
                disabled={this.props.disabled}
                onChange={this.handleToggleUseQueryEditor}/>
              Advanced Mode
            </label>
            <div className="help-block">
              Create your own query using an SQL editor
            </div>
          </div>
        </div>
      );
    }
  },

  renderQueryEditor() {
    if (this.props.query.get('advancedMode')) {
      return (
        <div>
          <label className="col-md-12 control-label">SQL Query</label>
          {this.renderQueryHelpBlock()}
          <div className="col-md-12">
            <CodeEditor
              readOnly={false}
              placeholder="e.g. SELECT `id`, `name` FROM `myTable`"
              value={this.getQuery()}
              mode={editorMode(this.props.componentId)}
              onChange={this.handleQueryChange}
              disabled={this.props.disabled}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      );
    }
  },

  renderSimpleTable() {
    if (this.props.showSimple && !this.props.query.get('advancedMode')) {
      var tableSelect = (
        <Select
          name="sourceTable"
          value={this.getTableValue()}
          placeholder="Select source table"
          onChange={this.handleSourceTableChange}
          optionRenderer={this.optionRenderer}
          options={this.transformOptions(this.sourceTableSelectOptions())}
          disabled={this.props.disabled}
        />
      );

      var loader = (
        <div className="form-control-static">
          <Loader/> Fetching table list from source database ...
        </div>
      );

      return (
        <div className="form-group">
          <label className="col-md-3 control-label">Source Table</label>
          <div className="col-md-9">
            { (this.props.isLoadingSourceTables) ? loader : tableSelect }
          </div>
        </div>
      );
    }
  },

  renderSimpleColumns() {
    if (this.props.showSimple && !this.props.query.get('advancedMode')) {
      var columnSelect = (
        <Select
          multi={true}
          name="columns"
          value={this.props.query.get('columns', Immutable.List())}
          disabled={this.props.disabled || !this.props.query.get('table')}
          placeholder="All columns will be imported"
          onChange={this.handleChangeColumns}
          options={this.getColumnsOptions()}/>
      );
      return (
        <div className="form-group">
          <label className="col-md-3 control-label">Columns</label>
          <div className="col-md-9">
            { columnSelect }
          </div>
        </div>
      );
    }
  },

  renderQueryHelpBlock() {
    if (this.props.componentId === 'keboola.ex-db-oracle') {
      return (
        <div className="col-md-12">
          <div className="help-block">
            Please do not put semicolons at the end of the query.
          </div>
        </div>
      );
    }
  },

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({value, label, render, disabled});

    return options.reduce((acc, o) => {
      const parent = option(o.value, o.label, (<strong style={{color: '#000'}}>Schema: {o.label}</strong>), true);
      const children = o.children.map(c => option(c.value, c.label, <div style={{paddingLeft: 10}}>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  }

});