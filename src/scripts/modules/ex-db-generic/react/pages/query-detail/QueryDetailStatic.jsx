import React from 'react';
import {CodeEditor} from '../../../../../react/common/common';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';

import editorMode from '../../../templates/editorMode';

export default React.createClass({
  displayName: 'ExDbQueryDetailStatic',
  propTypes: {
    query: React.PropTypes.object.isRequired,
    componentId: React.PropTypes.string.isRequired
  },

  renderQueryEditor() {
    if (this.props.query.get('query').length > 0) {
      return (
        <CodeEditor
          readOnly={true}
          lineNumbers={false}
          value={this.props.query.get('query')}
          mode={editorMode(this.props.componentId)}
          style={
            { width: '100%' }
          }
        />
      );
    } else {
      return (
        <div className="row kbc-header">
          <p className="text-muted">
            SQL query not set
          </p>
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
            <div className="col-md-4">
              <input
                className="form-control"
                type="text"
                value={this.props.query.get('name')}
                placeholder="Untitled Query"
                disabled={true}/>
            </div>
            <label className="col-md-2 control-label">Primary Key</label>
            <div className="col-md-4">
              <input
                className="form-control"
                type="text"
                value={this.props.query.get('primaryKey', []).join(', ')}
                placeholder="No primary key"
                disabled={true}/>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-2 control-label">Output table</label>
            <div className="col-md-4">
              <SapiTableLinkEx tableId={this.props.query.get('outputTable')}>
                <div className="form-control-static col-md-12">
                  {this.props.query.get('outputTable')}
                </div>
              </SapiTableLinkEx>
            </div>
            <div className="col-md-4 col-md-offset-2 checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.query.get('incremental')}
                  disabled={true}/>
                Incremental
              </label>
            </div>
          </div>
          <div className="form-group">
            <label className="col-md-12 control-label">SQL Query</label>
            <div className="col-md-12">
              {this.renderQueryEditor()}
            </div>
          </div>
        </div>
      </div>
    );
  }
});
