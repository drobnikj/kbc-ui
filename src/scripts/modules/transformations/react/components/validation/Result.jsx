import React from 'react';
import InvalidQuery from './InvalidQuery';

export default React.createClass({
  propTypes: {
    bucketId: React.PropTypes.string.isRequired,
    result: React.PropTypes.object.isRequired,
    onRedirect: React.PropTypes.func.isRequired
  },

  render() {
    if (this.props.result.count() > 0) {
      return (
        <div className="alert alert-danger">
          <h4>Following errors were found</h4>
          {this.props.result.map((error, index) => {
            switch (error.getIn(['object', 'type'])) {
              case 'query':
                return (
                  <InvalidQuery
                    bucketId={this.props.bucketId}
                    key={index}
                    transformationId={error.get('transformation')}
                    queryNumber={parseInt(error.getIn(['object', 'id']), 10)}
                    message={error.get('message')}
                    onClick={this.props.onRedirect}
                  />
                );
              default:
                return (
                  <p>{error.get('message')}</p>
                );
            }
          }).toArray()}
        </div>);
    } else {
      return (
        <span>SQL is valid.</span>
      );
    }
  }
});
