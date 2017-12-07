import React from 'react';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';
import routesStore from '../../../../../stores/RoutesStore';

import CredentialsForm from './CredentialsForm';
import SSLForm from './SSLForm';

import {Tabs, Tab} from 'react-bootstrap';

export default function(componentId, actionsProvisioning, storeProvisioning, credentialsTemplate, hasSshTunnel) {
  const actionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    mixins: [createStoreMixin(storeProvisioning.componentsStore)],

    getStateFromStores() {
      const config = routesStore.getCurrentRouteParam('config');
      const dbStore = storeProvisioning.createStore(componentId, config);
      const editingCredentials = dbStore.getEditingCredentials();
      const isEditing = dbStore.isEditingCredentials();
      const credentials = dbStore.getCredentials();
      return {
        configId: config,
        credentials: credentials,
        isEditing: isEditing,
        editingCredentials: editingCredentials,
        isSaving: dbStore.isSavingCredentials(),
        isValidCredentials: isEditing ? dbStore.hasValidCredentials(editingCredentials) : dbStore.hasValidCredentials(credentials)
      };
    },

    render() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <Tabs defaultActiveKey="db" animation={false} id="ex-db-generic-credentials-page-tabs">
              <Tab eventKey="db" title="Database Credentials">
                <CredentialsForm
                  isValidEditingCredentials={this.state.isValidCredentials}
                  credentials={(this.state.isEditing) ? this.state.editingCredentials : this.state.credentials}
                  savedCredentials={this.state.credentials}
                  enabled={!this.state.isSaving}
                  isEditing={this.state.isEditing}
                  onChange={this.handleChange}
                  componentId={componentId}
                  configId={this.state.configId}
                  credentialsTemplate={credentialsTemplate}
                  hasSshTunnel={hasSshTunnel}
                  actionCreators={actionCreators}
                />
              </Tab>
              {this.renderSSLForm()}
            </Tabs>
          </div>
        </div>
      );
    },

    renderSSLForm() {
      if (componentId === 'keboola.ex-db-mysql' || componentId === 'keboola.ex-db-mysql-custom') {
        return (
          <Tab eventKey="ssl" title="SSL">
            <SSLForm
              credentials={(this.state.isEditing) ? this.state.editingCredentials : this.state.credentials}
              enabled={!this.state.isSaving}
              onChange={this.handleChange}
              componentId={componentId}
              configId={this.state.configId}
              actionsProvisioning={actionCreators}
              isEditing={this.state.isEditing}
            />
          </Tab>
        );
      }
    },

    handleChange(newCredentials) {
      actionCreators.updateEditingCredentials(this.state.configId, newCredentials);
    }
  });
}
