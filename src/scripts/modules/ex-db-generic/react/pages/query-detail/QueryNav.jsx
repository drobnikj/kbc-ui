import React, {PropTypes} from 'react';
import SearchRow from '../../../../../react/common/SearchRow';
import NavRow from './QueryNavRow';

export default React.createClass({
  propTypes: {
    queries: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    actionsProvisioning: PropTypes.object.isRequired
  },
  render() {
    return (
      <div className="kbc-container">
        <SearchRow
          query={this.props.filter}
          onChange={this.handleFilterChange}
          />
        <div className="list-group">
          {this.rows()}
        </div>
      </div>
    );
  },

  rows() {
    if (this.props.queries.count()) {
      return this.props.queries.map(function(query) {
        return (
          <NavRow
            query={query}
            configurationId={this.props.configurationId}
            componentId={this.props.componentId}/>
        );
      }, this).toArray();
    } else {
      return (
        <div className="list-group-item">
          No queries found.
        </div>
      );
    }
  },

  handleFilterChange(newQuery) {
    const actionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    actionCreators.setQueriesFilter(this.props.configurationId, newQuery);
  }
});
