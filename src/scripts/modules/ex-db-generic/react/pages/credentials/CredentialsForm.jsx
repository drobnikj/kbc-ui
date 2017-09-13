import React from 'react';
import {Map} from 'immutable';
import Clipboard from '../../../../../react/common/Clipboard';

import {Input} from './../../../../../react/common/KbcBootstrap';
import TestCredentialsButtonGroup from '../../../../../react/common/TestCredentialsButtonGroup';
import StaticText from './../../../../../react/common/KbcBootstrap';
import Tooltip from '../../../../../react/common/Tooltip';
import SshTunnelRow from '../../../../../react/common/SshTunnelRow';

export default React.createClass({
  displayName: 'ExDbCredentialsForm',
  propTypes: {
    savedCredentials: React.PropTypes.object.isRequired,
    credentials: React.PropTypes.object.isRequired,
    enabled: React.PropTypes.bool.isRequired,
    isValidEditingCredentials: React.PropTypes.bool.isRequired,
    onChange: React.PropTypes.func,
    componentId: React.PropTypes.string.isRequired,
    configId: React.PropTypes.string.isRequired,
    credentialsTemplate: React.PropTypes.object.isRequired,
    hasSshTunnel: React.PropTypes.func.isRequired,
    actionsProvisioning: React.PropTypes.object.isRequired
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
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    return ExDbActionCreators.testCredentials(this.props.configId, this.props.credentials);
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
        label={this.renderProtectedLabel(labelValue, !!savedValue)}
        type="password"
        placeholder={(savedValue) ? 'type new password to change it' : ''}
        value={this.props.credentials.get(propName)}
        labelClassName="col-xs-4"
        wrapperClassName="col-xs-8"
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
            label={labelValue}
            type={type}
            value={this.props.credentials.get(propName)}
            labelClassName="col-xs-4"
            wrapperClassName="col-xs-8"
            onChange={this.handleChange.bind(this, propName)}/>
        );
      }
    } else if (isProtected) {
      return (
        <StaticText
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
          label={labelValue}
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8">
          {this.props.credentials.get(propName)}
          {(this.props.credentials.get(propName)) ? <Clipboard text={this.props.credentials.get(propName)}/> : null}
        </StaticText>
      );
    }
  },

  renderFields() {
    return this.props.credentialsTemplate.getFields(this.props.componentId).map(function(field) {
      return this.createInput(field[0], field[1], field[2], field[3]);
    });
  },

  renderSshRow() {
    if (this.props.hasSshTunnel(this.props.componentId)) {
      return (
        <SshTunnelRow
          isEditing={this.props.enabled}
          data={this.props.credentials.get('ssh', Map())}
          onChange={(sshObject) => this.props.onChange(this.props.credentials.set('ssh', sshObject))}
        />
      );
    }
  },

  render() {
    return (
      <form className="form-horizontal">
        <div className="row">
          {this.renderFields()}
        </div>
        {this.renderSshRow()}
        <TestCredentialsButtonGroup
          disabled={(this.props.enabled) ? !this.props.isValidEditingCredentials : false}
          testCredentialsFn={this.testCredentials}
        />
      </form>
    );
  }
});

