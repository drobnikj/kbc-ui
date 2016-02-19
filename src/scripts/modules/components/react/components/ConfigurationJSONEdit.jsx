import React, {PropTypes} from 'react';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Sticky from 'react-sticky';
import JSONSchemaEditor from './JSONSchemaEditor';
import JobsEditor from './ConfigurationJobsEditor';
import SchemasStore from '../../stores/SchemasStore';
import RoutesStore from '../../../../stores/RoutesStore';
import Immutable from 'immutable';
import propagateApiAttributes from './jsoneditor/propagateApiAttributes';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';

/* global require */
require('./configuration-json.less');

export default React.createClass({

  mixins: [createStoreMixin(SchemasStore)],

  getStateFromStores() {
    var componentId = RoutesStore.getCurrentRouteParam('component');
    return {
      paramsSchema: SchemasStore.getParamsSchema(componentId).toJSON(),
      pureParamsSchema: SchemasStore.getPureParamsSchema(componentId).toJSON(),
      jobsTemplates: SchemasStore.getJobsTemplates(componentId),
      apiSchema: SchemasStore.getApiSchema(componentId).toJSON(),
      apiTemplate: SchemasStore.getApiTemplate(componentId).toJSON()
    };
  },

  propTypes: {
    data: PropTypes.string.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isValid: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    saveLabel: PropTypes.string
  },

  getDefaultProps() {
    return {
      saveLabel: 'Save configuration'
    };
  },

  jobsValue: Immutable.List(),
  paramsValue: Immutable.Map(),
  apiValue: Immutable.Map(),

  componentDidMount() {
    var parsed = JSON.parse(this.props.data);

    if (parsed.config) {
      this.paramsValue = Immutable.fromJS(parsed.config).delete('jobs');
    } else {
      this.paramsValue = Immutable.Map();
    }

    if (parsed.config && parsed.config.jobs) {
      this.jobsValue = Immutable.fromJS(parsed.config.jobs);
    } else {
      this.jobsValue = Immutable.List();
    }

    if (this.requiresApiSchema()) {
      if (parsed.api) {
        this.apiValue = Immutable.fromJS(parsed.api);
      } else {
        this.apiValue = Immutable.Map();
      }
    } else {
      this.apiValue = Immutable.fromJS(this.state.apiTemplate);
    }
  },

  render() {
    return (
      <div className="kbc-configuration-json-edit">
        <div>
          <div className="edit kbc-configuration-editor">
            <Sticky stickyClass="kbc-sticky-buttons-active" className="kbc-sticky-buttons" topOffset={-60} stickyStyle={{}}>
              <ConfirmButtons
                isSaving={this.props.isSaving}
                onSave={this.props.onSave}
                onCancel={this.props.onCancel}
                placement="right"
                saveLabel={this.props.saveLabel}
                isDisabled={!this.props.isValid}
                />
            </Sticky>
            {this.apiEditor()}
            <JSONSchemaEditor
              schema={this.prepareParamsSchema()}
              value={this.paramsValue.toJS()}
              onChange={this.handleParamsChange}
              readOnly={this.props.isSaving}
            />
            <h3>Jobs</h3>
            <JobsEditor
              templates={this.state.jobsTemplates}
              value={this.jobsValue}
              onChange={this.handleJobsChange}
              readOnly={this.props.isSaving}
              />
          </div>
        </div>
      </div>
    );
  },

  apiEditor() {
    if (this.requiresApiSchema()) {
      return (
        <JSONSchemaEditor
          schema={Immutable.fromJS(this.state.apiSchema)}
          value={this.apiValue.toJS()}
          onChange={this.handleApiChange}
          readOnly={this.props.isSaving}
          />
      );
    } else {
      return null;
    }
  },

  requiresApiSchema() {
    return Object.keys(this.state.apiTemplate).length === 0;
  },

  prepareParamsSchema() {
    if (!this.requiresApiSchema()) {
      return Immutable.fromJS(this.state.pureParamsSchema);
    } else {
      return propagateApiAttributes(this.apiValue, Immutable.fromJS(this.state.paramsSchema));
    }
  },

  handleJobsChange(value) {
    this.jobsValue = value;
    this.handleChange();
  },

  handleParamsChange(value) {
    this.paramsValue = Immutable.fromJS(value);
    this.handleChange();
  },

  handleApiChange(value) {
    this.apiValue = Immutable.fromJS(value);
    this.handleChange();
  },

  handleChange() {
    var config = {
      api: this.apiValue.toJS(),
      config: this.paramsValue.toJS()
    };
    config.config.jobs = this.jobsValue.toJS();
    this.props.onChange(JSON.stringify(config));
  }
});
