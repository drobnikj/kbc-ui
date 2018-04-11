import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Edit from './QueriesEdit';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButtons from '../../../../../react/common/SaveButtons';
import ValidateQueriesButton from '../../components/ValidateQueriesButton';

/* global require */
require('codemirror/mode/sql/sql');
require('./queries.less');

export default React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    bucketId: PropTypes.string.isRequired,
    transformation: PropTypes.object.isRequired,
    queries: PropTypes.string.isRequired,
    splitQueries: PropTypes.object.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isQueriesProcessing: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired,
    highlightQueryNumber: PropTypes.number
  },

  render() {
    return (
      <div>
        <h2 style={{lineHeight: '32px'}}>
          Queries
          <small>
            <Clipboard text={this.props.queries}/>
          </small>
          {this.renderButtons()}
        </h2>

        {this.queries()}
      </div>
    );
  },

  renderButtons() {
    return (
      <span className="pull-right">
        <ValidateQueriesButton
          bucketId={this.props.bucketId}
          transformationId={this.props.transformation.get('id')}
          backend={this.props.transformation.get('backend')}
          disabled={this.props.isChanged || this.props.isQueriesProcessing}
        />
        <SaveButtons
          isSaving={this.props.isSaving}
          disabled={this.props.isQueriesProcessing}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
            />
      </span>
    );
  },

  queries() {
    return (
      <Edit
        queries={this.props.queries}
        splitQueries={this.props.splitQueries}
        backend={this.props.transformation.get('backend')}
        disabled={this.props.isSaving}
        onChange={this.props.onEditChange}
        highlightQueryNumber={this.props.highlightQueryNumber}
        />
    );
  }
});
