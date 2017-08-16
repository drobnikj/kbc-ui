
import React from 'react';
import {CodeEditor} from '../../../../react/common/common';
import Select from '../../../../react/common/Select';

import AutoSuggestWrapper from '../../../transformations/react/components/mapping/AutoSuggestWrapper';
import editorMode from '../../templates/editorMode';

export default React.createClass({
  displayName: 'ExDbQueryEditor',
  propTypes: {
    query: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    showOutputTable: React.PropTypes.bool,
    configId: React.PropTypes.string.isRequired,
    defaultOutputTable: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired
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
                suggestions={this._tableSelectOptions()}
                placeholder={this.tableNamePlaceholder()}
                value={this.props.query.get('outputTable')}
                onChange={this.handleOutputTableChange}/>
            </div>
            <div className="help-block">
              if empty then default will be used
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
  }
});
