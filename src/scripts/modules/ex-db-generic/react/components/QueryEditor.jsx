
import React from 'react';
import Immutable from 'immutable';
import _ from 'underscore';
import {CodeEditor} from '../../../../react/common/common';
import Select from '../../../../react/common/Select';

import AutoSuggestWrapper from '../../../transformations/react/components/mapping/AutoSuggestWrapper';
import editorMode from '../../templates/editorMode';

export default React.createClass({
  displayName: 'ExDbQueryEditor',
  propTypes: {
    query: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    sourceTables: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    showSimple: React.PropTypes.bool,
    configId: React.PropTypes.string.isRequired,
    defaultOutputTable: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    localState: React.PropTypes.object.isRequired,
    updateLocalState: React.PropTypes.func.isRequired
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

  sourceTableSelectOptions() {
    if (this.props.sourceTables) {
      this.props.simpleDisabled = false;
      return this.props.sourceTables.map(function(table) {
        return table.get('name');
      });
    } else {
      this.props.simpleDisabled = true;
      return {};
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
      var mapping = valmap.set('table', newValue);
      mapping = mapping.set('columns', Immutable.List());
      if (newValue === '') {
        mapping = mapping.set('query', '');
      } else {
        mapping = mapping.set('query', 'SELECT * FROM ' + newValue);
      }
      return mapping;
    });
    return this.props.onChange(query);
  },

  getColumnsOptions() {
    var columns = [];
    if (this.props.query.get('table')) {
      var matchedTable = this.props.sourceTables.find((table) =>
        table.get('name') === this.props.query.get('table')
      );
      if (!matchedTable) {
        return [];
      }
      columns = matchedTable.get('columns', Immutable.List()).toJS();
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
      var mapping = valmap.set('columns', newValue);
      mapping = mapping.set('query', 'SELECT ' + newValue.join(', ') + ' FROM ' + valmap.get('table'));
      return mapping;
    });
    return this.props.onChange(query);
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

  render() {
    return (
      <div className="row">
        <div className="form-horizontal">
          <div className="form-group">
            <label className="col-md-2 control-label">Name</label>
            <div className="col-md-10">
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
            <label className="col-md-2 control-label">Output Table</label>
            <div className="col-md-10">
              <AutoSuggestWrapper
                suggestions={this.tableSelectOptions()}
                placeholder={this.tableNamePlaceholder()}
                value={this.props.query.get('outputTable')}
                onChange={this.handleOutputTableChange}/>
              <div className="help-block">
                if empty then default will be used
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">Primary Key</label>
            <div className="col-md-6">
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
          <div className="form-group">
            <label className="col-md-2 control-label">Source Table</label>
            <div className="col-md-4">
              <AutoSuggestWrapper
                suggestions={this.sourceTableSelectOptions()}
                placeholder="Select Source Table"
                value={this.props.query.get('table')}
                disabled={this.props.simpleDisabled}
                onChange={this.handleSourceTableChange}/>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">Columns</label>
            <div className="col-md-4">
              <Select
                multi={true}
                name="columns"
                value={this.props.query.get('columns', Immutable.List()).toJS()}
                disabled={this.props.simpleDisabled || !this.props.query.get('table')}
                placeholder="All columns will be imported"
                onChange={this.handleChangeColumns}
                options={this.getColumnsOptions()}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-12 control-label">SQL Query</label>
            {this.renderQueryHelpBlock()}
            <div className="col-md-12">
              <CodeEditor
                readOnly={false}
                placeholder="e.g. SELECT `id`, `name` FROM `myTable`"
                value={this.props.query.get('query')}
                mode={editorMode(this.props.componentId)}
                onChange={this.handleQueryChange}
                style={
                  {width: '100%'}
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  },

  localState(path, defaultVal) {
    return this.props.localState.getIn(path, defaultVal);
  },

  updateLocalState(path, newValue) {
    return this.props.updateLocalState([].concat(path), newValue);
  }
});
