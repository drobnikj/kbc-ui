import React, {PropTypes} from 'react/addons';

import {Check, Loader} from 'kbc-react-components';
import DeleteButton from '../../../../../react/common/DeleteButton';
import Tooltip from '../../../../../react/common/Tooltip';
import Confirm from '../../../../../react/common/Confirm';

import actionCreators from '../../../actionCreators';

export default React.createClass({
  propTypes: {
    dimension: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired
  },
  mixins: [React.addons.PureRenderMixin],

  render() {
    const dimension = this.props.dimension.get('data');

    return (
      <tr>
        <td>{dimension.get('name')}</td>
        <td>
          <Check isChecked={dimension.get('includeTime')} />
        </td>
        <td>{dimension.get('identifier')}</td>
        <td>{dimension.get('template')}</td>
        <td className="text-right">
          {this.deleteButton()}
          {this.uploadButton()}
        </td>
      </tr>
    );
  },

  deleteButton() {
    return React.createElement(DeleteButton, {
      tooltip: 'Delete date dimension',
      isPending: this.props.dimension.get('pendingActions').contains('delete'),
      confirm: {
        title: 'Delete Date Dimension',
        text: this.deleteText(),
        onConfirm: this.handleDelete
      }
    });
  },

  uploadButton() {
    if (this.props.dimension.get('pendingActions').contains('upload')) {
      return (
        <span className="btn btn-link">
          <Loader className="fa-fw"/>
        </span>
      );
    } else {
      const isExported = this.props.dimension.getIn(['data', 'isExported'], false),
        tooltip = isExported ?
          'Dimension is already exported to GoodData' :
          'Upload date dimension to GoodData';

      return (
        <Confirm
          text={this.uploadText()}
          title="Upload Date Dimension"
          buttonLabel="Upload"
          buttonType="success"
          onConfirm={this.handleUpload}
        >
          <Tooltip tooltip={tooltip}>
            <button className="btn btn-link" disabled={isExported}>
              <span className="fa fa-upload fa-fw"/>
            </button>
          </Tooltip>
        </Confirm>
      );
    }
  },

  deleteText() {
    return (
      <span>
        Do you really want to delete the date dimension <strong>{this.props.dimension.getIn(['data', 'name'])}</strong> ?
      </span>
    );
  },

  uploadText() {
    return (
      <span>
        Do you really want to upload the date dimension <strong>{this.props.dimension.getIn(['data', 'name'])}</strong> to the
        GoodData project?
      </span>
    );
  },

  handleDelete() {
    actionCreators.deleteDateDimension(this.props.configurationId, this.props.dimension.get('name'));
  },

  handleUpload() {
    actionCreators.uploadDateDimensionToGoodData(this.props.configurationId, this.props.dimension.get('name'), this.props.pid);
  }
});
