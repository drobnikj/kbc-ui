import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';

import RoutesStore from '../../../../stores/RoutesStore';
import {Navigation} from 'react-router';

import SaveButtons from '../../../../react/common/SaveButtons';


export default function(componentId, actionsProvisioning, storeProvisioning) {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'CredentialsHeaderButtons',
    mixins: [createStoreMixin(storeProvisioning.componentsStore), Navigation],

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      return {
        configId: configId,
        localState: ExDbStore.getLocalState(componentId, configId)
      };
    },

    handleReset() {
      return ExDbActionCreators.cancelCredentialsEdit(this.state.configId);
    },

    handleSave() {
      return ExDbActionCreators.saveCredentialsEdit(this.state.configId);
    },

    render() {
      return (
        <div className="kbc-buttons">
          <SaveButtons
            isSaving={this.state.localState.get('isSavingCredentials', false)}
            isChanged={this.state.localState.get('isChangedCredentials', false)}
            onReset={this.handleReset}
            onSave={this.handleSave}
          />
        </div>
      );
    }
  });
}

