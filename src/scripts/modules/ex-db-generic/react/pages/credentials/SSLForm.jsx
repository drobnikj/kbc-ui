import React from 'react';
import _ from 'underscore';

import Textarea from 'react-textarea-autosize';
import {Input} from './../../../../../react/common/KbcBootstrap';
import TestCredentials from '../../../../../react/common/TestCredentialsButtonGroup';
import {NewLineToBr, Check} from 'kbc-react-components';

const helpUrl = 'https://help.keboola.com/extractors/database/sqldb/#mysql-encryption';

export default React.createClass({
  displayName: 'SSLForm',
  propTypes: {
    credentials: React.PropTypes.object.isRequired,
    enabled: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func,
    componentId: React.PropTypes.string.isRequired,
    actionsProvisioning: React.PropTypes.object.isRequired
  },

  getDefaultProps() {
    return function() {};
  },

  handleChange(propName, event) {
    return this.props.onChange(this.props.credentials.setIn(['ssl', propName], event.target.value));
  },

  handleToggle(propName, event) {
    return this.props.onChange(this.props.credentials.setIn(['ssl', propName], event.target.checked));
  },

  isSSLEnabled() {
    return this.props.credentials.getIn(['ssl', 'enabled']);
  },

  testCredentials() {
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    return ExDbActionCreators.testCredentials(this.props.configId, this.props.credentials);
  },

  createEnableSSLCheckbox(propName) {
    if (this.props.enabled) {
      return (
        <div className="form-group">
          <Input
            label="Enable encrypted connection"
            type="checkbox"
            onChange={this.handleToggle(propName).bind(this)}
            checked={this.isSSLEnabled()}
          />
        </div>
      );
    } else {
      return (
        <div className="form-horizontal">
          <div className="form-group">
            <label className="control-label col-xs-4">
              Encrypted connection
            </label>
            <div>
              <p className="form-control-static col-xs-8">
                <Check isChecked={this.isSSLEnabled()}/>
              </p>
            </div>
          </div>
        </div>
      );
    }
  },

  createStaticControl(labelValue, propName) {
    var staticProp = 'Not set.';
    if (this.props.credentials.getIn['ssl', propName]) {
      staticProp = <NewLineToBr text={this.props.credentials.getIn(['ssl', propName])}/>
    }
    return (
      <div className="form-group">
        <label className="control-label">
          {labelValue}
        </label>
        <div>
          <p className="form-control-static">
            {staticProp}
          </p>
        </div>
      </div>
    );
  },

  createInput(labelValue, propName, help = null) {
    if (this.props.enabled) {
      return (
        <div className="form-group">
          <label className="control-label">
            {labelValue}
          </label>
          {(help) ? <p className="help-block">{help}</p> : null}
          <Textarea
            label={labelValue}
            type="textarea"
            value={this.props.credentials.getIn(['ssl', propName])}
            onChange={this.handleChange(propName).bind(this)}
            className="form-control"
            minRows={4}
          />
        </div>
      );
    } else {
      return this.createStaticControl(labelValue, propName);
    }
  },

  render() {
    var sslPortion = null;
    if (this.isSSLEnabled()) {
      sslPortion = (
        <div className="row">
          {this.createInput('SSL Client Certificate (client-cert.pem)', 'cert')};
          {this.createInput('SSL Client Key (client-key.pem)', 'key')};
          {this.createInput('SSL CA Certificate (ca-cert.pem)', 'ca')};
          {this.createInput(
            'SSL Cipher',
            'cipher',
            'You can optionally provide a list of permissible ciphers to use for the SSL encryption.')}
          <TestCredentials
            testCredentialsFn={this.testCredentials}
            hasOffset={false}
          />
        </div>
      );
    }
    return (
      <form>
        <div className="row">
          <div className="well">
            The MySQL database extractor supports secure (encrypted) connections
            between MySQL clients and the server using SSL.
            Provide a set of SSL certificates to configure the secure connection. Read more on
            <a href={helpUrl}>How to Configure MySQL server - DB Admin's article.</a>
          </div>
        </div>
        <div className="row">
          {this.createEnableSSLCheckbox('enabled')}
        </div>
        {sslPortion}
      </form>
    );
  }
});
