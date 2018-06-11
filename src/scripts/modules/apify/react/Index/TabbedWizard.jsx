import React, {PropTypes} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import RadioGroup from 'react-radio-group';
import {Input} from '../../../../react/common/KbcBootstrap';
import SapiTableSelector from '../../../components/react/components/SapiTableSelector';
import ApifyObjectSelector from './ApifyObjectSelector';

export const CRAWLER_KEY = 1;
export const AUTH_KEY = 2;
export const OPTIONS_KEY = 3;

import CodeMirror from 'react-code-mirror';
/* global require */
require('codemirror/addon/lint/lint');
require('../../../../utils/codemirror/json-lint');


export default React.createClass({

  propTypes: {
    localState: PropTypes.object.isRequired,
    settings: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    updateSettings: PropTypes.func.isRequired,
    crawlers: PropTypes.object.isRequired,
    actors: PropTypes.object.isRequired,
    inputTableId: PropTypes.string,
    updateInputTableId: PropTypes.func.isRequired,
    step: PropTypes.number.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    parameters: PropTypes.object.isRequired,
    loadCrawlers: PropTypes.func.isRequired,
    loadActors: PropTypes.func.isRequired,
    updateParameters: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired
  },

  render() {
    return (
      <span>
        <Tabs className="tabs-inside-modal" activeKey={this.props.step} animation={false} onSelect={this.props.selectTab} id="controlled-tab-wizard">
          <Tab title="Action"
            eventKey={CRAWLER_KEY} disabled={this.isTabDisabled(CRAWLER_KEY)}>
            {this.renderActionForm()}
          </Tab>
          {['crawler', 'dataset', 'actor'].includes(this.props.action) ?
           <Tab title="Authentication" eventKey={AUTH_KEY}
             disabled={this.isTabDisabled(AUTH_KEY)}>
             {this.renderTokenForm()}
           </Tab>
           : null
          }
          <Tab title="Specification"
            eventKey={OPTIONS_KEY} disabled={this.isTabDisabled(OPTIONS_KEY)} >
            {this.props.step === OPTIONS_KEY ? this.renderOptionsContent() : null}
          </Tab>
        </Tabs>

      </span>
    );
  },

  renderOptionsContent() {
    switch (this.props.action) {
      case 'crawler':
      case 'executionId':
        return this.renderCrawlerSettingsForm();
      case 'dataset':
        return this.renderDatasetSettingsForm();
      case 'actor':
        return this.renderActorSettingsForm();
      default:
        return null;
    }
  },

  renderActorSettingsForm() {
    return (
      <div className="form-horizontal">
        {this.renderActorSelector()}
        {this.renderInput(
           'Memory',
           'memory',
           '(Optional) Specifies the amount of memory allocated for Actor run.',
           '2048'
        )}
        {this.renderInput(
           'Build',
           'build',
           '(Optional) Tag or number of Actor build to run (e.g. latest or 1.2.34)',
           'latest'
        )}

        <div className="form-group">
          <div className="col-xs-2 control-label">
            Actor Input
          </div>
          <div className="col-xs-10">
            <CodeMirror
              theme="solarized"
              lineNumbers={false}
              value={this.props.settings}
              readOnly={false}
              mode="application/json"
              lineWrapping={true}
              autofocus={false}
              onChange={this.handleCrawlerSettingsChange}
              lint={true}
              gutters={['CodeMirror-lint-markers']}/>
            <div className="help-text">
              (Optional) Contains input for the Actor in JSON format.
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderActionForm() {
    return (
      <RadioGroup
        name="Action"
        value={this.props.action}
        onChange={(e) => this.updateParameter('action', e.target.value)}
      >
        <Input
          type="radio"
          label="Run Crawler"
          help="Runs a specific Crawler and retrieves its results if it finishes successfully."
          value="crawler"
        />
        <Input
          type="radio"
          label="Run Actor"
          help="Runs a specific Actor and retrieves its results if it finishes successfully."
          value="actor"
        />
        <Input
          type="radio"
          label="Retrieve results from Crawler run"
          help="Retrieves the results from a Crawler run specified by its Execution ID."
          value="executionId"
        />
        <Input
          type="radio"
          label="Retrieve items from Dataset"
          help="Retrieves items from a Dataset specified by its ID or name."
          value="dataset"
        />
      </RadioGroup>
    );
  },

  renderDatasetSettingsForm() {
    return (
      <div className="form-horizontal">
        {this.renderInput('Dataset', 'datasetId', 'ID or name of the Dataset to fetch the data from.', 'Enter dataset id or dataset name')}
      </div>
    );
  },

  renderCrawlerSettingsForm() {
    const editor = (
      <CodeMirror
        theme="solarized"
        lineNumbers={false}
        value={this.props.settings}
        readOnly={false}
        mode="application/json"
        lineWrapping={true}
        autofocus={false}
        onChange={this.handleCrawlerSettingsChange}
        lint={true}
        gutters={['CodeMirror-lint-markers']}
      />
    );
    const eidHelp = 'Execution ID of the Crawler run to retrieve the results from.';
    const executionIdControl = (
      <div className="form-horizontal">
        {this.renderInput('Execution ID', 'executionId', eidHelp, 'Enter Execution ID')}
      </div>
    );
    const action = this.props.action;
    return (
      action === 'executionId' ? executionIdControl
      :
      <div className="form-horizontal">
        {this.renderCrawlerSelector()}
        {this.renderInputTableIdSelector()}
        <div className="form-group">
          <div className="col-xs-2 control-label">
            Crawler Settings
          </div>
          <div className="col-xs-10">
            {editor}
            <div className="help-text">
              Optional parameter. Specifies a JSON object with properties that override the default crawler settings. For more information, see <a href="https://www.apify.com/docs#crawlers" target="_blank" rel="noopener noreferrer">documentation</a>.
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderInputTableIdSelector() {
    const error = false;

    return (
      <div className={error ? 'form-group has-error' : 'form-group'}>
        <div className="col-xs-2 control-label">
          Input Table
        </div>
        <div className="col-xs-10">
          <SapiTableSelector
            clearable={true}
            onSelectTableFn={this.props.updateInputTableId}
            placeholder="Select table"
            value={this.props.inputTableId || ''}
          />
          <span className="help-block">
            Optional parameter. Data from the input table will be pushed to crawler, where you can access them through the Key-value store. The ID of the Key-value store will be saved to the customData attribute of the crawler execution.
          </span>
        </div>
      </div>
    );
  },

  handleCrawlerSettingsChange(e) {
    const value = e.target.value;
    this.props.updateSettings(value);
  },


  isTabDisabled(tabKey) {
    return this.props.step !== tabKey;
  },

  renderTokenForm() {
    const userHelp = <span>User ID from your <a href="https://my.apify.com/account#/integrations" target="_blank" rel="noopener noreferrer">account page</a>.</span>;
    const tokenHelp = <span>API token from your <a href="https://my.apify.com/account#/integrations" target="_blank" rel="noopener noreferrer">account page</a>.</span>;
    return (
      <div className="form-horizontal">
        {this.renderInput('User ID', 'userId', userHelp, 'Enter User ID')}
        {this.renderInput('Token', '#token', tokenHelp, 'Enter token')}
      </div>

    );
  },

  renderCrawlerSelector() {
    return (
      <ApifyObjectSelector
        objectName="crawler"
        objectLabelKey="customId"
        object={this.props.crawlers}
        selectedValue={this.props.parameters.get('crawlerId')}
        onLoadObjectsList={this.props.loadCrawlers}
        onSelect={(crawlerId) => this.updateParameter('crawlerId', crawlerId)}
      />
    );
  },

  renderActorSelector() {
    return (
      <ApifyObjectSelector
        objectName="actor"
        objectLabelKey="name"
        object={this.props.actors}
        selectedValue={this.props.parameters.get('actId')}
        onLoadObjectsList={this.props.loadActors}
        onSelect={(actId) => this.updateParameter('actId', actId)}
      />
    );
  },

  renderInputControl(propertyPath, placeholder) {
    const propValue = this.parameter(propertyPath, '');
    const isEncrypted = propValue.includes('KBC::') && (propValue.includes('Encrypted') || propValue.includes('Secure'));
    let value = '';
    let placeholderValue = '';
    if (isEncrypted ) {
      value = '';
      placeholderValue = 'Encrypted value, leave blank to keep it';
    } else {
      value = propValue;
      placeholderValue = placeholder;
    }
    return (
      <input
        placeholder={placeholderValue}
        type="text"
        value={value}
        onChange={(e) => this.updateParameter(propertyPath, e.target.value)}
        className="form-control"
      />
    );
  },

  parameter(key, defaultValue) {
    return this.props.parameters.get(key, defaultValue);
  },

  updateParameter(key, newValue) {
    this.props.updateParameters(this.props.parameters.set(key, newValue));
  },

  renderInput(caption, propertyPath, helpText, placeholder, validationFn = () => null) {
    const validationText = validationFn();

    const inputControl = this.renderInputControl(propertyPath, placeholder);
    return this.renderFormControl(caption, inputControl, helpText, validationText);
  },


  renderFormControl(controlLabel, control, helpText, errorMsg) {
    return (
      <div className={errorMsg ? 'form-group has-error' : 'form-group'}>
        <label className="col-xs-2 control-label">
          {controlLabel}
        </label>
        <div className="col-xs-10">
          {control}
          <span className="help-block">
            {errorMsg || helpText}
          </span>
        </div>
      </div>
    );
  }

});
