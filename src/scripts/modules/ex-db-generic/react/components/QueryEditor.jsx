
import React from 'react';
import Immutable from 'immutable';
import _ from 'underscore';
import {Loader} from 'kbc-react-components';
import {CodeEditor} from '../../../../react/common/common';
import Select from '../../../../react/common/Select';

import {loadingSourceTablesPath} from '../../storeProvisioning';
import {sourceTablesPath} from '../../storeProvisioning';
import {getSimpleQuery} from '../../storeProvisioning';

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
    if (query.get('query') !== getSimpleQuery(query.get('table'), query.get('columns'))) {
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

  handleToggleUseQueryEditor(e) {
    return this.setState({
      useQueryEditor: e.target.checked,
      simpleDisabled: e.target.checked
    });
  },

  handleOutputTableChange(newValue) {
    return this.props.onChange(this.props.query.set('outputTable', newValue));
  },

  handlePrimaryKeyChange(newValue) {
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
      const tableMap = this.sourceTables().map(function(table) {
        return {
          label: table.get('name'),
          value: table.get('name')
        };
      });
      return tableMap.toList().sort(function(valA, valB) {
        return (valA.label - valB.label);
      }).toJS();
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

  handleSourceTableChange(newValue) {
    const query = this.props.query.withMutations(function(valmap) {
      var simpleQuery = getSimpleQuery(newValue, valmap.get('columns'));
      var mapping = valmap.set('table', newValue);
      mapping = mapping.set('query', simpleQuery);
      return mapping;
    });
    return this.props.onChange(query);
  },

  getColumnsOptions() {
    var columns = [];
    if (this.props.query.get('table')) {
      if (this.isLoadingSourceTables()) {
        return [];
      } else {
        var matchedTable = this.sourceTables().find((table) =>
          table.get('name') === this.props.query.get('table')
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
    const query = this.props.query.withMutations(function(valmap) {
      var simpleQuery = getSimpleQuery(valmap.get('table'), newValue);
      var mapping = valmap.set('columns', newValue);
      mapping = mapping.set('query', simpleQuery);
      return mapping;
    });
    return this.props.onChange(query);
  },

  getQuery() {
    return this.props.query.get('query');
  },

  localState(path, defaultVal) {
    return this.props.localState.getIn(path, defaultVal);
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState(this.props.configId, [].concat(path), newValue);
  },

  render() {
    return (
      <div className="row">
        <div className="form-horizontal">
          <div className="form-group">
            <label className="col-md-3 control-label">Name</label>
            <div className="col-md-9">
              <input
              className="form-control"
              type="text"
              value={this.props.query.get('name')}
              ref="queryName"
              placeholder="e.g. Untitled Query"
              onChange={this.handleNameChange}
              autoFocus={true}/>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 control-label">Output Table</label>
            <div className="col-md-9">
              <AutoSuggestWrapper
                suggestions={this.tableSelectOptions()}
                placeholder={this.tableNamePlaceholder()}
                value={this.props.query.get('outputTable')}
                onChange={this.handleOutputTableChange}/>
              <div className="help-block">
                If left empty, the default value will be used
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-3 control-label">Primary Key</label>
            <div className="col-md-5">
              <Select
                name="primaryKey"
                value={this.props.query.get('primaryKey')}
                multi={true}
                disabled={false}
                allowCreate={true}
                delimiter=","
                placeholder="No primary key"
                emptyStrings={false}
                onChange={this.handlePrimaryKeyChange}
              />
            </div>
            <div className="col-md-4 checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.query.get('incremental')}
                  onChange={this.handleIncrementalChange}/>
                Incremental
              </label>
            </div>
          </div>
          {this.renderSimpleTable()}
          {this.renderSimpleColumns()}

          <div className="form-group">
            <div className="help-block col-md-8 col-md-offset-3 checkbox">
              <label>
                <input
                  standalone={true}
                  type="checkbox"
                  label="Use query editor"
                  checked={this.state.useQueryEditor}
                  onChange={this.handleToggleUseQueryEditor}/>
                Use Query Editor
              </label>
            </div>
            {this.renderQueryEditor()}
          </div>
        </div>
      </div>
    );
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
              style={
                {width: '100%'}
              }
            />
          </div>
        </div>
      );
    }
  },

  renderSimpleTable() {
    if (this.props.showSimple) {
      var tableSelect = (
        <Select
          name="sourceTable"
          value={this.props.query.get('table')}
          disabled={this.isSimpleDisabled()}
          placeholder="Select source table"
          onChange={this.handleSourceTableChange}
          options={this.sourceTableSelectOptions()}
        />
      );

      var loader = (
        <div className="form-control-static">
          <Loader/>
        </div>
      );

      return (
        <div className="form-group">
          <label className="col-md-3 control-label">Source Table</label>
          <div className="col-md-5">
            { (this.isLoadingSourceTables()) ? loader : tableSelect }
          </div>
        </div>
      );
    }
  },

  renderSimpleColumns() {
    if (this.props.showSimple) {
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
      var loader = (
        <div className="form-control-static">
          <Loader/>
        </div>
      );
      return (
        <div className="form-group">
          <label className="col-md-3 control-label">Columns</label>
          <div className="col-md-5">
            { (this.isLoadingSourceTables()) ? loader : columnSelect }
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
  }
});