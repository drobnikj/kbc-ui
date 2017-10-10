import React from 'react';

import Tooltip from './../../../../react/common/Tooltip';
import {Loader} from 'kbc-react-components';
import {Navigation} from 'react-router';

export default React.createClass({
  displayName: 'QueryDeleteButton',
  mixins: [Navigation],
  propTypes: {
    query: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    tooltipPlacement: React.PropTypes.string,
    componentId: React.PropTypes.string,
    actionsProvisioning: React.PropTypes.object.isRequired,
    entityName: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      tooltipPlacement: 'top',
      entityName: 'Query'
    };
  },

  deleteQuery() {
    this.transitionTo(this.props.componentId, {config: this.props.configurationId});
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    setTimeout(
      ExDbActionCreators.deleteQuery, null, this.props.configurationId, this.props.query.get('id')
    );
  },

  render() {
    let deleteLabel = 'Delete ' + this.props.entityName;
    if (this.props.isPending) {
      return (
        <span className="btn btn-link">
          <Loader/>
        </span>
      );
    } else {
      return (
        <Tooltip
          tooltip={deleteLabel}
          id="delete"
          placement={this.props.tooltipPlacement}
        >
          <button
            className="btn btn-link"
            onClick={this.deleteQuery}
          >
            <i className="kbc-icon-cup"/>
          </button>
        </Tooltip>
      );
    }
  }
});

