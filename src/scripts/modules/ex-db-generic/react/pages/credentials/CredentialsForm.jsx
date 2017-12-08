import React from 'react';
import {Map} from 'immutable';
import Clipboard from '../../../../../react/common/Clipboard';

import TestCredentialsButtonGroup from '../../../../../react/common/TestCredentialsButtonGroup';
import {Input, FormControls} from './../../../../../react/common/KbcBootstrap';
import Tooltip from '../../../../../react/common/Tooltip';
import SshTunnelRow from '../../../../../react/common/SshTunnelRow';

import SSLForm from './SSLForm';

const StaticText = FormControls.Static;

export default React.createClass({
  propTypes: {
    savedCredentials: React.PropTypes.object.isRequired,
    credentials: React.PropTypes.object.isRequired,
    isEditing: React.PropTypes.bool.isRequired,
    isValidEditingCredentials: React.PropTypes.bool.isRequired,
    enabled: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func,
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    credentialsTemplate: React.PropTypes.object.isRequired,
    hasSshTunnel: React.PropTypes.func.isRequired,
    actionCreators: React.PropTypes.object.isRequired
  },

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
  },

  getDefaultProps() {
    return {
      onChange: function() {
        return {
          isValidEditingCredentials: true
        };
      }
    };
  },


  testCredentials() {
    return this.props.actionCreators.testCredentials(this.props.configId, this.props.credentials);
  },

  handleChange(propName, event) {
    let value = event.target.value;
    if (['port'].indexOf(propName) >= 0) {
      value = parseInt(event.target.value, 10);
    }
    return this.props.onChange(this.props.credentials.set(propName, value));
  },

  renderProtectedLabel(labelValue, alreadyEncrypted) {
    let msg = labelValue + 'will be stored securely encrypted.';
    if (alreadyEncrypted) {
      msg = msg + ' The most recently stored value will be used if left empty.';
    }
    return (
      <span>
        {labelValue}
        <small>
          <Tooltip tooltip={msg}>
            <span className="fa fa-fw fa-question-circle"/>
          </Tooltip>
        </small>
      </span>
    );
  },

  createProtectedInput(labelValue, propName) {
    let savedValue = this.props.savedCredentials.get(propName);

    return (
          <Input
            key={propName}
            label={this.renderProtectedLabel(labelValue, !!savedValue)}
            type="password"
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            placeholder={(savedValue) ? 'type new password to change it' : ''}
            value={this.props.credentials.get(propName)}
            onChange={this.handleChange.bind(this, propName)}/>
    );
  },

  createInput(labelValue, propName, type = 'text', isProtected = false) {
    if (this.props.enabled) {
      if (isProtected) {
        return this.createProtectedInput(labelValue, propName);
      } else {
        return (
          <Input
            key={propName}
            label={labelValue}
            type={type}
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            value={this.props.credentials.get(propName)}
            onChange={this.handleChange.bind(this, propName)}/>
        );
      }
    } else if (isProtected) {
      return (
        <StaticText
          key={propName}
          label={labelValue}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8">
          <Tooltip tooltip="Encrypted password">
            <span className="fa fa-fw fa-lock"/>
          </Tooltip>
        </StaticText>
      );
    } else {
      return (
        <StaticText
          key={propName}
          label={labelValue}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8">
          {this.props.credentials.get(propName)}
          {(this.props.credentials.get(propName)) ? <Clipboard text={this.props.credentials.get(propName).toString()}/> : null}
        </StaticText>
      );
    }
  },

  renderFields() {
    return this.props.credentialsTemplate.getFields(this.props.componentId).map(function(field) {
      return this.createInput(field[0], field[1], field[2], field[3]);
    }, this);
  },

  sshRowOnChange(sshObject) {
    return this.props.onChange(this.props.credentials.set('ssh', sshObject));
  },

  sslRowOnChange(sslObject) {
    return this.props.onChange(this.props.credentials.set('ssl', sslObject));
  },

  renderSshRow() {
    if (this.props.hasSshTunnel(this.props.componentId)) {
      return (
        <SshTunnelRow
          isEditing={this.props.enabled}
          data={this.props.credentials.get('ssh', Map())}
          onChange={this.sshRowOnChange}
        />
      );
    }
  },

  renderSSLForm() {
    if (this.props.componentId === 'keboola.ex-db-mysql' || this.props.componentId === 'keboola.ex-db-mysql-custom') {
      return (
        <SSLForm
          isEditing={this.props.enabled}
          data={this.props.credentials.get('ssl', Map())}
          onChange={this.sslRowOnChange}
        />
      );
    }
  },

  render() {
    const { componentId, configId, enabled, isValidEditingCredentials, isEditing } = this.props;
    return (
      <form className="form-horizontal">
        <div className="kbc-inner-content-padding-fix">
          {this.renderFields()}
          {this.renderSshRow()}
          {this.renderSSLForm()}
        </div>
        <TestCredentialsButtonGroup
          componentId={componentId}
          configId={configId}
          isEditing={isEditing}
          disabled={enabled ? !isValidEditingCredentials : false}
          testCredentialsFn={this.testCredentials}
        />
      </form>
    );
  }
});

