import React from 'react';

import {Navigation} from 'react-router';


export default React.createClass({
  displayName: 'CreateQueryElement',
  mixins: [Navigation],
  propTypes: {
    isNav: React.PropTypes.bool.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string,
    actionsProvisioning: React.PropTypes.object.isRequired
  },

  createQuery() {
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    let query = ExDbActionCreators.createQuery(this.props.configurationId);
    this.transitionTo(
      'ex-db-generic-' + this.props.componentId + '-query',
      {
        config: this.props.configurationId,
        query: query.get('id')
      }
    );
  },

  render() {
    if (this.props.isNav) {
      return (
        <a className="list-group-item" onClick={this.createQuery}>
          <strong><i className="kbc-icon-plus"/>
            Create a new entry
          </strong>
        </a>
      );
    } else {
      return (
        <button
          className="btn btn-success"
          onClick={this.createQuery}
        >
          <i className="kbc-icon-plus"/> New Query
        </button>
      );
    }
  }
});
