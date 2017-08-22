import React from 'react';
import ImmutableRenderMixin from '../../../../../react/mixins/ImmutableRendererMixin';
import {Map} from 'immutable';

import QueryRow from './QueryRow';


export default React.createClass({
  displayName: 'QueryTable',
  mixins: [ImmutableRenderMixin],
  propTypes: {
    queries: React.PropTypes.object,
    configurationId: React.PropTypes.string,
    componentId: React.PropTypes.string,
    pendingActions: React.PropTypes.object
  },

  render() {
    const children = this.props.queries.map(function(query) {
      return (
        <QueryRow
          query={query}
          componentId={this.props.componentId}
          pendingActions={this.props.pendingActions.get(query.get('id'), Map())}
          configurationId={this.props.configurationId}
          key={query.get('id')}
        />
      );
    }, this).toArray();

    return (
      <div className="table table-striped table-hover">
        <div className="thead" key="table-header">
          <div className="tr">
            <span className="th">
              <strong>Name</strong>
            </span>
            <span className="th">
              <strong>Output Table</strong>
            </span>
            <span className="th">
              <strong>Incremental</strong>
            </span>
            <span className="th">
              <strong>Primary Key</strong>
            </span>
          </div>
        </div>
        <div className="tbody">
          {children}
        </div>
      </div>
    );
  }
});
