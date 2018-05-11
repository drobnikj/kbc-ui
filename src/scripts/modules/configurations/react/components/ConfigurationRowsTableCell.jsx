import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import StorageApiTableLinkEx from '../../../components/react/components/StorageApiTableLinkEx';
import {columnTypes} from '../../../configurations/utils/createRoute';

const TableCell = React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    type: React.PropTypes.string.isRequired,
    valueFn: React.PropTypes.func.isRequired,
    row: React.PropTypes.object.isRequired,
    component: React.PropTypes.object.isRequired,
    componentId: React.PropTypes.string.isRequired,
    configurationId: React.PropTypes.string.isRequired
  },

  render() {
    if (this.props.type === columnTypes.STORAGE_LINK_DEFAULT_BUCKET) {
      const defaultBucketStage = this.props.component.getIn(['data', 'default_bucket_stage']);
      const sanitizedComponentId = this.props.component.get('id').replace(/[^a-zA-Z0-9-]/i, '-');
      const tableId = defaultBucketStage + '.c-' + sanitizedComponentId + '-' + this.props.configurationId + '.' + this.props.valueFn(this.props.row);
      return (
        <StorageApiTableLinkEx
          tableId={tableId}
        />
      );
    } else {
      return (
        <span>
          {this.props.valueFn(this.props.row)}
       </span>
      );
    }
  }
});

export default TableCell;
