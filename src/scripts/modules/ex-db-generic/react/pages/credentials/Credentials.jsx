import React, {PropTypes} from 'react';
import CredentialsForm from './CredentialsForm';
import SSLForm from './SSLForm';
import {TabbedArea, TabPane} from './../../../../../react/common/KbcBootstrap';

export default React.createClass({
  propTypes: {
    savedCredentials: PropTypes.object.isRequired,
    credentials: PropTypes.object.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isValidEditingCredentials: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    configId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    credentialsTemplate: PropTypes.object.isRequired,
    hasSshTunnel: PropTypes.func.isRequired,
    actionsProvisioning: PropTypes.object.isRequired
  },

  render() {
    return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <TabbedArea defaultActiveKey="db" animation={false} id="credentialstab">
              <TabPane eventKey="db" title="Database Credentials">
                <CredentialsForm
                    isValidEditingCredentials={this.props.isValidEditingCredentials}
                    savedCredentials={this.props.savedCredentials}
                    credentials={this.props.credentials}
                    enabled={this.props.isEditing}
                    onChange={this.props.onChange}
                    componentId={this.props.componentId}
                    configId={this.props.configId}
                    credentialsTemplate={this.props.credentialsTemplate}
                    hasSshTunnel={this.props.hasSshTunnel}
                    actionsProvisioning={this.props.actionsProvisioning}
                    isEditing={this.props.isEditing}
                />
              </TabPane>
              {this.renderSSLForm()}
            </TabbedArea>
          </div>
        </div>
    );
  },

  renderSSLForm() {
    if (this.props.componentId === 'keboola.ex-db-mysql' || this.props.componentId === 'keboola.ex-db-mysql-custom') {
      return (
        <TabPane eventKey="ssl" title="SSL">
          <SSLForm
            credentials={this.props.credentials}
            enabled={this.props.isEditing}
            onChange={this.props.onChange}
            componentId={this.props.componentId}
            configId={this.props.configId}
            actionsProvisioning={this.props.actionsProvisioning}
          />
        </TabPane>
      );
    }
  }

});
