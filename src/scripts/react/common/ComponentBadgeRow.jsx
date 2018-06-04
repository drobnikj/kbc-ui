import React, {PropTypes} from 'react';

import './Badges.less';

export default React.createClass({
  propTypes: {
    badges: PropTypes.array.isRequired
  },

  render() {
    return (
      <div className="badge-component-container">
        {this.props.badges.map((badge, idx) =>
          <div
            className={'badge badge-component-item badge-component-item-title badge-component-item-' + badge.key}
            title={badge.description}
            key={idx}
          >
            {badge.title}
          </div>
        )}
      </div>
    );
  }
});
