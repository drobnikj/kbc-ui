import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import RoutesStore from '../../../../stores/RoutesStore';
import ApplicationStore from '../../../../stores/ApplicationStore';
import InstalledComponentStore from '../../stores/InstalledComponentsStore';
import LatestJobsStore from '../../../jobs/stores/LatestJobsStore';

import ComponentDescription from '../components/ComponentDescription';
import ComponentMetadata from '../components/ComponentMetadata';
import RunComponentButton from '../components/RunComponentButton';
import DeleteConfigurationButton from '../components/DeleteConfigurationButton';
import LatestJobs from '../components/SidebarJobs';
import Configuration from '../components/Configuration';
//import TableInputMapping from '../components/generic/TableInputMapping';
import InstalledComponentsActionCreators from '../../InstalledComponentsActionCreators';


export default React.createClass({
  mixins: [createStoreMixin(InstalledComponentStore, LatestJobsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config'),
      componentId = RoutesStore.getCurrentRouteParam('component');

    console.log(InstalledComponentStore.getConfigDataParameters(componentId, configId));

    return {
      componentId: componentId,
      configDataParameters: InstalledComponentStore.getConfigDataParameters(componentId, configId),
      config: InstalledComponentStore.getConfig(componentId, configId),
      latestJobs: LatestJobsStore.getJobs(componentId, configId),
      isParametersEditing: InstalledComponentStore.isEditingRawConfigDataParameters(componentId, configId),
      isParametersSaving: InstalledComponentStore.isSavingConfigDataParameters(componentId, configId),
      editingConfigDataParameters: InstalledComponentStore.getEditingRawConfigDataParameters(componentId, configId, '{}'),
      isValidEditingConfigDataParameters: InstalledComponentStore.isValidEditingConfigDataParameters(componentId, configId)
    };
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="row kbc-header">
            <ComponentDescription
              componentId={this.state.componentId}
              configId={this.state.config.get('id')}
              />
          </div>
          <div className="row">
            <div classNmae="col-xs-4">
              <div>Input Mapping Tables</div>
              <div>Input Mapping Files</div>
              <div>Output Mapping Tables</div>
              <div>Output Mapping Files</div>
              <Configuration
                data={this.getConfigDataParameters()}
                isEditing={this.state.isParametersEditing}
                isSaving={this.state.isParametersSaving}
                onEditStart={this.onEditParametersStart}
                onEditCancel={this.onEditParametersCancel}
                onEditChange={this.onEditParametersChange}
                onEditSubmit={this.onEditParametersSubmit}
                isValid={this.state.isValidEditingConfigDataParameters}
                />
            </div>
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <div classNmae="kbc-buttons kbc-text-light">
            <ComponentMetadata
              componentId={this.state.componentId}
              configId={this.state.config.get('id')}
              />
          </div>
          <ul className="nav nav-stacked">
            <li>
              <RunComponentButton
                title="Run"
                component={this.state.componentId}
                mode="link"
                runParams={this.runParams()}
                >
                You are about to run component.
              </RunComponentButton>
            </li>
            <li>
              <DeleteConfigurationButton
                componentId={this.state.componentId}
                configId={this.state.config.get('id')}
                />
            </li>
          </ul>
          <LatestJobs jobs={this.state.latestJobs} />
        </div>
      </div>
    );
  },

  runParams() {
    return () => ({config: this.state.config.get('id')});
  },

  contactSupport() {
    /*global Zenbox*/
    /* eslint camelcase: 0 */
    Zenbox.init({
      request_subject: 'Configuration assistance request',
      dropboxID: ApplicationStore.getKbcVars().getIn(['zendesk', 'project', 'dropboxId']),
      url: ApplicationStore.getKbcVars().getIn(['zendesk', 'project', 'url'])
    });
    Zenbox.show();
  },

  getConfigDataParameters() {
    if(this.state.isParametersEditing) {
      return this.state.editingConfigDataParameters;
    } else {
      return JSON.stringify(this.state.configDataParameters.toJSON(), null, '  ');
    }
  },

  onEditParametersStart() {
    InstalledComponentsActionCreators.startEditComponentRawConfigDataParameters(this.state.componentId, this.state.config.get('id'));
  },

  onEditParametersCancel() {
    InstalledComponentsActionCreators.cancelEditComponentRawConfigDataParameters(this.state.componentId, this.state.config.get('id'));
  },

  onEditParametersChange(newValue) {
    InstalledComponentsActionCreators.updateEditComponentRawConfigDataParameters(this.state.componentId, this.state.config.get('id'), newValue);
  },

  onEditParametersSubmit() {
    InstalledComponentsActionCreators.saveComponentRawConfigDataParameters(this.state.componentId, this.state.config.get('id'));
  }
});
