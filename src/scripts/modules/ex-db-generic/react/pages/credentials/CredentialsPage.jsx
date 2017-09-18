import React from 'react';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import routesStore from '../../../../../stores/RoutesStore';

import CredentialsForm from './CredentialsForm';
import SSLForm from './SSLForm';

import {TabbedArea, TabPane} from './../../../../../react/common/KbcBootstrap';

export default function(componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, hasSshTunnel) {
  const actionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore)],

    getStateFromStores() {
      const config = routesStore.getCurrentRouteParam('config');
      const dbStore = storeProvisioning.createStore(componentId, config);
      const editingCredentials = dbStore.getEditingCredentials();
      const isEditing = dbStore.isEditingCredentials();
      return {
        configId: config,
        credentials: dbStore.getCredentials(),
        isEditing: isEditing,
        editingCredentials: editingCredentials,
        isSaving: dbStore.isSavingCredentials(),
        isValidEditingCredentials: isEditing ? dbStore.hasValidCredentials(editingCredentials) : false
      };
    },

    render() {
      return (
        <div className="container-fluid kbc-main-content">
          <TabbedArea defaultActiveKey="db" animation={false} id="credentialstab">
            <TabPane eventKey="db" title="Database Credentials">
              <CredentialsForm
                isValidEditingCredentials={this.state.isValidEditingCredentials}
                credentials={(this.state.isEditing) ? this.state.editingCredentials : this.state.credentials}
                savedCredentials={this.state.credentials}
                enabled={!this.state.isSaving}
                onChange={this.handleChange}
                componentId={componentId}
                configId={this.state.configId}
                credentialsTemplate={credentialsTemplate}
                hasSshTunnel={hasSshTunnel}
                actionCreators={actionCreators}
              />
            </TabPane>
            {this.renderSSLForm()}
          </TabbedArea>
        </div>
      );
    },

    renderSSLForm() {
      if (componentId === 'keboola.ex-db-mysql' || componentId === 'keboola.ex-db-mysql-custom') {
        return (
          <TabPane eventKey="ssl" title="SSL">
            <SSLForm
              credentials={this.state.credentials}
              enabled={!this.state.isSaving}
              onChange={this.handleChange}
              componentId={componentId}
              configId={this.state.configId}
              actionsProvisioning={actionCreators}
            />
          </TabPane>
        );
      }
    },

    handleChange(newCredentials) {
      actionCreators.updateEditingCredentials(this.state.configId, newCredentials);
    }
  });
}
