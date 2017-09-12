import React from 'react';
import ImmutableRenderMixin from '../../../../../react/mixins/ImmutableRendererMixin';

import {Link} from 'react-router';
import {Check} from 'kbc-react-components';
import QueryDeleteButton from '../../components/QueryDeleteButton';
import RunExtractionButton from '../../../../components/react/components/RunComponentButton';
import SapiTableLinkEx from '../../../../components/react/components/StorageApiTableLinkEx';
import ActivateDeactivateButton from '../../../../../react/common/ActivateDeactivateButton';

import * as actionsProvisioning from '../../../actionsProvisioning';

export default React.createClass({
  displayName: 'QueryRow',
  mixins: [ImmutableRenderMixin],
  propTypes: {
    query: React.PropTypes.object.isRequired,
    pendingActions: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired
  },

  handleActiveChange(newValue) {
    const actionCreators = actionsProvisioning.createActions(this.props.componentId);
    return actionCreators.changeQueryEnabledState(this.props.configurationId, this.props.query.get('id'), newValue);
  },

  renderQueryName() {
    if (this.props.query.get('name')) {
      return this.props.query.get('name');
    } else {
      return (
        <span className="text-muted">Untitled</span>
      );
    }
  },

  render() {
    const actionCreators = actionsProvisioning.createActions(this.props.componentId);
    const link = 'ex-db-generic-' + this.props.componentId + '-query';
    return (
      <Link
        className="tr"
        to={link}
        params={{
          config: this.props.configurationId,
          query: this.props.query.get('id')
        }}
      >
        <span className="td kbc-break-all">{this.renderQueryName()}</span>
        <span className="td kbc-break-all"><SapiTableLinkEx tableId={this.props.query.get('outputTable')}/></span>
        <span className="td"><Check isChecked={this.props.query.get('incremental')}/></span>
        <span className="td">{this.props.query.get('primaryKey', []).join(', ')}</span>
        <span className="td text-right kbc-no-wrap">
          <QueryDeleteButton
            query={this.props.query}
            configurationId={this.props.configurationId}
            isPending={!!this.props.pendingActions.get('deleteQuery')}
            deleteFn={actionCreators.deleteQuery}
            componentId={this.props.componentId}
            actionsProvisioning={actionsProvisioning}
          />
          <ActivateDeactivateButton
            activateTooltip="Enable Query"
            deactivateTooltip="Disable Query"
            isActive={this.props.query.get('enabled')}
            isPending={this.props.pendingActions.get('enabled')}
            onChange={this.handleActiveChange}
          />
          <RunExtractionButton
            title="Run Extraction"
            component={this.props.componentId}
            runParams={() => {
              return {
                config: this.props.configurationId,
                configData: actionCreators.prepareSingleQueryRunData(this.props.configurationId, this.props.query)
              };
            }}
          >You are about to run extraction</RunExtractionButton>
        </span>
      </Link>
    );
  }
});