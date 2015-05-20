import React from 'react';
import {Loader} from 'kbc-react-components';

const LEFT = 'left', RIGHT = 'right';

export default React.createClass({
  propTypes: {
    isLoading: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string,
    loaderPosition: React.PropTypes.oneOf([LEFT, RIGHT])
  },

  getDefaultProps() {
    return {
      title: 'Refresh',
      loaderPosition: RIGHT
    };
  },

  render() {
    return (
        <span title={this.props.title}>
          {this.props.isLoading ? this.loader() : this.refreshIcon()}
        </span>
    );
  },

  loader() {
    return (
        <Loader/>
    );
  },

  refreshIcon() {
    return (
        <span {...this.props} className="kbc-refresh kbc-icon-cw"></span>
    );
  }

});
