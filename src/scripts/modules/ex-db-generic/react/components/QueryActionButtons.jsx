import React from 'react';
import {Map} from 'immutable';

import RoutesStore from '../../../../stores/RoutesStore';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import QueryDeleteButton from './QueryDeleteButton';
import RunExtractionButton from '../../../components/react/components/RunComponentButton';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';

export default function(
  componentId,
  actionsProvisioning,
  storeProvisioning,
  entityName = 'Query'
) {
  const actionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore)],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config'),
        ExDbStore = storeProvisioning.createStore(componentId, configId),
        queryId = RoutesStore.getCurrentRouteIntParam('query'),
        query = ExDbStore.getConfigQuery(queryId);

      return {
        configId: configId,
        queryId: queryId,
        query: query,
        pendingActions: ExDbStore.getQueriesPendingActions().get(query.get('id'), Map())
      };
    },

    componentWillReceiveProps() {
      this.setState(this.getStateFromStores());
    },

    render() {
      return (
        <div>
          <QueryDeleteButton
            componentId={componentId}
            query={this.state.query}
            configurationId={this.state.configId}
            isPending={!!this.state.pendingActions.get('deleteQuery')}
            tooltipPlacement="bottom"
            actionsProvisioning={actionsProvisioning}
            entityName={entityName}
          />
          <ActivateDeactivateButton
            activateTooltip={'Enable ' + entityName}
            deactivateTooltip={'Disable ' + entityName}
            isActive={this.state.query.get('enabled')}
            isPending={this.state.pendingActions.get('enabled')}
            onChange={this.handleActiveChange}
            tooltipPlacement="bottom"
          />
          <RunExtractionButton
            title="Run Extraction"
            component={componentId}
            runParams={this.runParams}
            config={this.state.configId}
            tooltipPlacement="bottom"
          >
            You are about to run an extraction.
          </RunExtractionButton>
        </div>
      );
    },

    runParams() {
      return {
        config: this.state.configId,
        configData: actionCreators.prepareSingleQueryRunData(this.state.configId, this.state.query)
      };
    },

    handleActiveChange(newValue) {
      actionCreators.changeQueryEnabledState(this.state.configId, this.state.query.get('id'), newValue);
    }

  });
}
