import React from 'react';
import NewTransformationBucketButton from './NewTransformationBucketButton';
import TransformationsEmptyImage from '../../../../../images/transformations-empty.png';
require('./EmptyStateIndex.less');

export default React.createClass({
  render() {
    return (
      <div className="row transformation-index-empty-state">
        <span className="col-md-4 text-center"><img src={TransformationsEmptyImage} /></span>
        <span className="col-md-8">
          <h2>Transformations allow you to modify your data.</h2>
          <p>Transformation pick data from Storage, manipulate it and then store it back. They can be written in SQL (MySQL, Redshift, Snowflake), R, Python or OpenRefine.</p>
          <p className="add-button"><NewTransformationBucketButton label="Add Transformation Bucket"/></p>
          <p className="help"><small><strong>What is a transformation bucket?</strong><br />A transformation bucket is a container for related transformations. Once the bucket is created, you can start creating transformations inside it.</small></p>
        </span>
      </div>
    );
  }
});
