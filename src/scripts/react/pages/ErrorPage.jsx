import React from 'react';
import Alert from 'react-bootstrap/lib/Alert';

import createStoreMixin from '../mixins/createStoreMixin';
import RoutesStore from '../../stores/RoutesStore';

export default React.createClass({
  mixins: [createStoreMixin(RoutesStore)],

  getStateFromStores() {
    return {
      error: RoutesStore.getError()
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="kbc-main-content">
          <Alert bsStyle="danger">
            <div>
              <p>
                {this.state.error && this.state.error.getText()}
              </p>
              {this.state.error && (
                <p>
                  {'Exception id: ' + this.state.error.getExceptionId()}
                </p>
              )}
            </div>
          </Alert>
        </div>
      </div>
    );
  }
});
