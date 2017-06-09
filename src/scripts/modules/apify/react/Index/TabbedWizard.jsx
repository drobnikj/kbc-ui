import React, {PropTypes} from 'react';
import {List} from 'immutable';
import {InputGroup, FormControl, Tab, Tabs} from 'react-bootstrap';
import Select from 'react-select';
// import {Loader} from 'kbc-react-components';
import {RefreshIcon} from 'kbc-react-components';
export const AUTH_KEY = 1;
export const CRAWLER_KEY = 2;
export const OPTIONS_KEY = 3;

import CodeMirror from 'react-code-mirror';
/* global require */
require('codemirror/addon/lint/lint');
require('../../../../utils/codemirror/json-lint');


export default React.createClass({

  propTypes: {
    localState: PropTypes.object.isRequired,
    settings: PropTypes.string.isRequired,
    updateSettings: PropTypes.func.isRequired,
    crawlers: PropTypes.object.isRequired,
    step: PropTypes.number.isRequired,
    updateLocalState: PropTypes.func.isRequired,
    parameters: PropTypes.object.isRequired,
    loadCrawlers: PropTypes.func.isRequired,
    updateParameters: PropTypes.func.isRequired,
    selectTab: PropTypes.func.isRequired
  },

  /* getInitialState() {
   *   return {
   *     step: AUTH_KEY
   *   };
   * },*/

  render() {
    return (
      <span>
        <Tabs activeKey={this.props.step} animation={false} onSelect={this.props.selectTab} id="controlled-tab-wizard">
          <Tab title="Authentication" eventKey={AUTH_KEY}
            disabled={this.isTabDisabled(AUTH_KEY)}>
            {this.renderTokenForm()}
          </Tab>
          <Tab title="Select Crawler"
            eventKey={CRAWLER_KEY} disabled={this.isTabDisabled(CRAWLER_KEY)}>
            {this.renderCrawlersForm()}
          </Tab>
          <Tab title="Crawler Settings (optional)"
            eventKey={OPTIONS_KEY} disabled={this.isTabDisabled(OPTIONS_KEY)}/>
        </Tabs>
        {this.props.step === OPTIONS_KEY ? this.renderCrawlerSettingsForm() : null}
      </span>
    );
  },

  renderCrawlerSettingsForm() {
    const editor = (
      <CodeMirror
        theme="solarized"
        lineNumbers={true}
        value={this.props.settings}
        readOnly={true}
        height="auto"
        mode="application/json"
        lineWrapping={true}
        autofocus={true}
        onChange={this.handleCrawlerSettingsChange}
        lint={true}
        gutters={['CodeMirror-lint-markers']}
      />
    );
    return (
      <div className="row form-horizontal clearfix">
        <div className="col-xs-10">
          {editor}
        </div>
      </div>
    );
  },

  handleCrawlerSettingsChange(e) {
    const value = e.target.value;
    this.props.updateSettings(value);
  },


  isTabDisabled(tabKey) {
    return this.props.step !== tabKey && false;
  },

  renderTokenForm() {
    return (
      <div className="row form-horizontal clearfix">
        {this.renderInput('User ID', 'userId', 'user Id', 'Enter User ID')}
        {this.renderInput('Token', '#token', 'manage token', 'Enter token')}
      </div>

    );
  },

  renderCrawlersForm() {
    return (
      <div className="row form-horizontal clearfix">
        {this.renderCrawlerSelector()}
      </div>
    );
  },

  renderCrawlerSelector() {
    const crawlersData = this.props.crawlers.get('data') || List();
    const value = this.props.parameters.get('crawlerId');
    const isLoading = this.props.crawlers.get('loading');
    const error = this.props.crawlers.get('error');
    const refresh = (
      <span>
        {isLoading ? 'Loading list of crawlers... ' : null}
        <RefreshIcon
          isLoading={isLoading}
          onClick={this.props.loadCrawlers}/>
      </span>

    );
    const staticElement = (
      <FormControl.Static>
        {isLoading ? refresh
         : error}
      </FormControl.Static>
    );
    const options = crawlersData.map((c) => {
      return {value: c.get('id'), label: c.get('customId')};
    }).toArray();
    const selectControl = (
      <InputGroup>
        <Select
          name="ids"
          key="ids"
          clearable={false}
          multi={false}
          options={options}
          value={value}
          onChange={({value: crawlerId}) => this.updateParameter('crawlerId', crawlerId)}/>
        <InputGroup.Addon>{refresh}</InputGroup.Addon>
      </InputGroup>);
    return (
      <div className={error ? 'form-group has-error' : 'form-group'}>
        <div className="col-xs-8">
          {isLoading || error ? staticElement : selectControl}
        </div>
      </div>
    );
  },


  // this.renderFormControl('User Crawlers', isLoading || error ? staticElement : selectControl, '', !!error);


  renderInputControl(propertyPath, placeholder) {
    return (
      <input
        placeholder={placeholder}
        type="text"
        value={this.parameter(propertyPath)}
        onChange={(e) => this.updateParameter(propertyPath, e.target.value)}
        className="form-control"
      />
    );
  },

  parameter(key) {
    return this.props.parameters.get(key);
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
