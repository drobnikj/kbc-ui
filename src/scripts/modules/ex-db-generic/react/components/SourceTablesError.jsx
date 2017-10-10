import React from 'react';

import {loadSourceTables} from '../../actionsProvisioning';
import {Loader} from 'kbc-react-components';

export default React.createClass({
  displayName: 'SourceTablesError',
  propTypes: {
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string,
    sourceTablesLoading: React.PropTypes.bool,
    sourceTablesError: React.PropTypes.string
  },

  retry() {
    loadSourceTables(this.props.componentId, this.props.configId);
  },

  render() {
    if (this.props.sourceTablesError) {
      return (
        <div className="alert alert-danger">
          <h4>An Error occured fetching table listing</h4>
          {this.props.sourceTablesError}
          <div className="form-control-static">
            {(this.props.sourceTablesLoading) ? (
              <div>
                <Loader/> Retrying fetch of table list from source database ...
              </div>
              ) : (
                <button
                className="btn btn-danger"
                onClick={this.retry}
                >
                  Try again
                </button>
              )
            }
          </div>
        </div>
      );
    } else return null;
  }
});
