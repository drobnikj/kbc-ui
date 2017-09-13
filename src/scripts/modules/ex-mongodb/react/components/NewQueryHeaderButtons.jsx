import React from 'react';
import {Navigation} from 'react-router';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';

import RoutesStore from '../../../../stores/RoutesStore';

import {Loader} from 'kbc-react-components';


export default function(componentId, actionsProvisioning, storeProvisioning) {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'NewQueryHeaderButtons',
    mixins: [createStoreMixin(storeProvisioning.componentsStore), Navigation],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      return {
        currentConfigId: configId,
        isSaving: ExDbStore.isSavingNewQuery(),
        isValid: ExDbStore.isValidNewQuery()
      };
    },

    handleCancel() {
      ExDbActionCreators.resetNewQuery(this.state.currentConfigId);
      this.transitionTo(componentId, {config: this.state.currentConfigId});
    },

    handleCreate() {
      return ExDbActionCreators.createQuery(this.state.currentConfigId)
        .then(function() {
          return this.transitionTo(componentId, {config: this.state.currentConfigId});
        });
    },

    render() {
      return (
        <div className="kbc-buttons">
          {(this.state.isSaving) ? <Loader/> : ''}
          <button
            className="btn btn-link"
            onClick={this.handleCancel}
            disabled={this.state.isSaving}
          >Cancel</button>
          <button
            className="btn btn-success"
            onClick={this.handleCreate()}
            disabled={this.state.isSaving || !this.state.isValid}
          >Create Query</button>
        </div>
      );
    }
  });
}
