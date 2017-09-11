
import React from 'react';
import Immutable from 'immutable';
import _ from 'underscore';
import {Loader} from 'kbc-react-components';
import {CodeEditor} from '../../../../react/common/common';
import Select from '../../../../react/common/Select';

import {loadingSourceTablesPath} from '../../storeProvisioning';
import {sourceTablesPath} from '../../storeProvisioning';
import {sourceTablesErrorPath} from '../../storeProvisioning';

import AutoSuggestWrapper from '../../../transformations/react/components/mapping/AutoSuggestWrapper';
import editorMode from '../../templates/editorMode';

export default React.createClass({
  displayName: 'ExDbQueryEditor',
  propTypes: {
    query: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    showSimple: React.PropTypes.bool.isRequired,
    configId: React.PropTypes.string.isRequired,
    defaultOutputTable: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    localState: React.PropTypes.object.isRequired,
    updateLocalState: React.PropTypes.func.isRequired
  },

  getInitialState() {
    const query = this.props.query;
    if (query.get('advancedMode') || !this.props.showSimple) {
      return {
        simpleDisabled: true,
        useQueryEditor: true
      };
    } else {
      return {
        simpleDisabled: false,
        useQueryEditor: false
      };
    }
  },

  isExistingTable() {
    const destinationTable = this.props.query.get('outputTable');
    if (!destinationTable || destinationTable === '') {
      return false;
    }
    return this.props.tables.has(destinationTable);
  },

  handleToggleUseQueryEditor(e) {
    var pk = [];
    if (e.target.checked) {
      this.setState({
        useQueryEditor: e.target.checked,
        simpleDisabled: e.target.checked,
        simplePk: this.props.query.get('primaryKey')
      });
      pk = this.state.advancedPk;
    } else {
      this.setState({
        useQueryEditor: e.target.checked,
        simpleDisabled: e.target.checked,
        advancedPk: this.props.query.get('primaryKey')
      });
      pk = this.state.simplePk;
    }

    var immutable = this.props.query.withMutations(function(mapping) {
      let query = mapping.set('advancedMode', e.target.checked);
      query = query.set('primaryKey', pk);
      return query;
    }, e);
    return this.props.onChange(immutable);
  },

  handleOutputTableChange(newValue) {
    return this.props.onChange(this.props.query.set('outputTable', newValue));
  },

  getColumnsGroupedByPrimaryKey(targetTable) {
    var matchedTable = this.sourceTables().find((table) =>
      table.get('schema') === targetTable.get('schema')
      && table.get('name') === targetTable.get('tableName')
    );
    if (!matchedTable) {
      return [];
    }
    return matchedTable.get('columns').groupBy(column => column.get('primaryKey'));
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
    return this.props.onChange(this.props.query.set('name', event.target.value));
  },

  tableNamePlaceholder() {
    return 'default: ' + this.props.defaultOutputTable;
  },

  isLoadingSourceTables() {
    return this.localState(loadingSourceTablesPath);
  },

  isSimpleDisabled() {
    return !!this.state.simpleDisabled;
  },

  sourceTables() {
    return this.localState(sourceTablesPath);
  },

  sourceTableSelectOptions() {
    if (this.sourceTables() && this.sourceTables().count() > 0) {
      const groupedTables = this.sourceTables().groupBy(table => table.get('schema'));
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
    const groupedCols = this.getColumnsGroupedByPrimaryKey(Immutable.fromJS(newValue));
    if (groupedCols.has(true)) {
      return groupedCols.get(true).map((column) => {
        return column.get('name');
      }).toJS();
    } else {
      return [];
    }
  },

  handleSourceTableChange(newValue) {
    return this.props.onChange(
      this.props.query
        .set('table', Immutable.fromJS(newValue))
        .set('name', newValue.tableName)
        .set('primaryKey', this.getPksOnSourceTableChange(newValue))
    );
  },

  getColumnsOptions() {
    var columns = [];
    if (this.props.query.get('table')) {
      if (this.isLoadingSourceTables() || this.localState(sourceTablesErrorPath)) {
        return [];
      } else {
        var matchedTable = this.sourceTables().find((table) =>
          table.get('schema') === this.props.query.get('table').get('schema')
          && table.get('name') === this.props.query.get('table').get('tableName')
        );
        if (!matchedTable) {
          return [];
        }
        columns = matchedTable.get('columns', Immutable.List()).toJS();
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
    return this.props.onChange(this.props.query.set('columns', newValue));
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

  localState(path, defaultVal) {
    return this.props.localState.getIn(path, defaultVal);
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState([].concat(path), newValue);
  },

  render() {
    return (
      <div className="row">
        <div className="form-horizontal">
          {this.renderError()}
          {this.renderSimpleTable()}
          {this.renderSimpleColumns()}
          <div className="form-group">
            <label className="col-md-3 control-label">Primary Key</label>
            <div className="col-md-6">
              <Select
                name="primaryKey"
                value={this.props.query.get('primaryKey')}
                multi={true}
                disabled={this.isExistingTable()}
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
          <div className="form-group">
            <label className="col-md-3 control-label">Name</label>
            <div className="col-md-6">
              <input
                className="form-control"
                type="text"
                value={this.props.query.get('name')}
                ref="queryName"
                placeholder="e.g. Untitled Query"
                onChange={this.handleNameChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 control-label">Output Table</label>
            <div className="col-md-6">
              <AutoSuggestWrapper
                suggestions={this.tableSelectOptions()}
                placeholder={this.tableNamePlaceholder()}
                value={this.props.query.get('outputTable')}
                onChange={this.handleOutputTableChange}/>
              <div className="help-block">
                If left empty, the default value will be used
              </div>
            </div>
            <div className="col-md-3 checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.query.get('incremental')}
                  onChange={this.handleIncrementalChange}/>
                Incremental
              </label>
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
        <div className="help-block col-md-8 col-md-offset-3 checkbox">
          <label>
            <input
              standalone={true}
              type="checkbox"
              label="Use query editor"
              checked={this.state.useQueryEditor}
              onChange={this.handleToggleUseQueryEditor}/>
            Advanced Mode: Create your own query
          </label>
        </div>
      );
    }
  },

  renderQueryEditor() {
    if (this.state.useQueryEditor) {
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
              style={{ width: '100%' }}
            />
          </div>
        </div>
      );
    }
  },

  renderSimpleTable() {
    if (this.props.showSimple && !this.state.simpleDisabled) {
      var tableSelect = (
        <Select
          name="sourceTable"
          value={this.getTableValue()}
          placeholder="Select source table"
          onChange={this.handleSourceTableChange}
          optionRenderer={this.optionRenderer}
          options={this.transformOptions(this.sourceTableSelectOptions())}
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
          <div className="col-md-6">
            { (this.isLoadingSourceTables()) ? loader : tableSelect }
          </div>
        </div>
      );
    }
  },

  renderSimpleColumns() {
    if (this.props.showSimple && !this.state.simpleDisabled) {
      var columnSelect = (
        <Select
          multi={true}
          name="columns"
          value={this.props.query.get('columns', Immutable.List())}
          disabled={this.isSimpleDisabled() || !this.props.query.get('table')}
          placeholder="All columns will be imported"
          onChange={this.handleChangeColumns}
          options={this.getColumnsOptions()}/>
      );
      return (
        <div className="form-group">
          <label className="col-md-3 control-label">Columns</label>
          <div className="col-md-6">
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

  renderError() {
    if (this.localState(sourceTablesErrorPath)) {
      return (
        <div className="alert alert-danger">
          <h4>An Error occured fetching table listing</h4>
          {this.localState(sourceTablesErrorPath)}
          <h5>
            Refresh the page to force a retry
          </h5>
        </div>
      );
    }
  },

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({value, label, render, disabled});

    return options.reduce((acc, o) => {
      const parent = option(o.value, o.label, (<strong style={{color: '#000'}}>{o.label}</strong>), true);
      const children = o.children.map(c => option(c.value, c.label, <div style={{paddingLeft: 10}}>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  }

});
