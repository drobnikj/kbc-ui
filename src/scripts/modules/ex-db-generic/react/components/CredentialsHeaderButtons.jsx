import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';

import RoutesStore from '../../../../stores/RoutesStore';

import {Navigation} from 'react-router';

import {Loader} from 'kbc-react-components';

export default function(componentId, actionsProvisioning, storeProvisioning) {
  const actionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'CredentialsHeaderButtons',
    mixins: [createStoreMixin(storeProvisioning.componentsStore), Navigation],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      const creds = ExDbStore.getEditingCredentials(configId);
      return {
        currentConfigId: configId,
        isEditing: ExDbStore.isEditingCredentials(),
        isSaving: ExDbStore.isSavingCredentials(),
        isValid: ExDbStore.hasValidCredentials(creds)
      };
    },

    handleEditStart() {
      return ExDbActionCreators.editCredentials(this.state.currentConfigId);
    },

    handleCancel() {
      return ExDbActionCreators.cancelCredentialsEdit(this.state.currentConfigId);
    },

    handleCreate() {
      ExDbActionCreators.saveCredentialsEdit(this.state.currentConfigId);
    },

    render() {

      if (this.state.isEditing) {
        return (
          <div className="kbc-buttons">
            {(this.state.loading) ? <Loader/>}
            <button
              className="btn btn-link"
              disabled={this.state.isSaving}
              onClick={this.handleCancel}
            >Cancel
            </button>
            <button
              className="btn btn-success"
              disabled={this.state.isSaving || !this.state.isValid}
              onClick={this.handleCreate}
            >Save
            </button>
          </div>
        );
      } else {
        return (
          <div>
            <button
              className="btn btn-success"
              disabled={this.state.isSaving}
              onClick={this.handleEditStart()}
            >
              <span className="fa fa-edit">Edit Credentials</span>
            </button>
          </div>
        );
      }
    }
  });
}
