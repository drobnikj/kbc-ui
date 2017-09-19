import React, {PropTypes} from 'react';
import {Link} from 'react-router';

export default React.createClass({
  propTypes: {
    query: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired
  },
  render() {
    return (
      <Link
        className="list-group-item"
        to={`ex-db-generic-${this.props.componentId}-query`}
        params={this.linkParams()}
        >
        <strong>{this.renderName()}</strong>
      </Link>
    );
  },

  renderName() {
    if (this.props.query.get('name').trim() === '') {
      return <span className="text-muted">[Untitled]</span>;
    } else {
      return this.props.query.get('name');
    }
  },

  linkParams() {
    return {
      config: this.props.configurationId,
      query: this.props.query.get('id')
    };
  }
});
