import React, {PropTypes} from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import _ from 'underscore';

export default React.createClass({
  propTypes: {
    tooltip: PropTypes.any.isRequired,
    id: PropTypes.string,
    children: PropTypes.any,
    placement: PropTypes.string
  },

  getDefaultProps() {
    return {
      placement: 'right'
    };
  },

  render() {
    const tooltip = (
      <Tooltip id={this.props.id || _.uniqueId('tooltip_')}>
        {this.props.tooltip}
      </Tooltip>);
    return (
      <OverlayTrigger placement={this.props.placement} overlay={tooltip}>
        {this.props.children}
      </OverlayTrigger>
    );
  }
});
