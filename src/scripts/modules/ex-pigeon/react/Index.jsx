import React from 'react';

import storeProvisioning, {storeMixins} from '../storeProvisioning';
import InstalledComponentStore from '../../components/stores/InstalledComponentsStore';
import RoutesStore from '../../../stores/RoutesStore';
import createStoreMixin from '../../../react/mixins/createStoreMixin';
import LatestJobsStore from '../../jobs/stores/LatestJobsStore';

// actions
import actionsProvisioning from '../actionsProvisioning';

// ui components
import ComponentMetadata from '../../components/react/components/ComponentMetadata';
import ComponentDescription from '../../components/react/components/ComponentDescription';
import LatestVersions from '../../components/react/components/SidebarVersionsWrapper';
import RunComponentButton from '../../components/react/components/RunComponentButton';
import DeleteConfigurationButton from '../../components/react/components/DeleteConfigurationButton';
import SaveButtons from '../../../react/common/SaveButtons';
import LatestJobs from '../../components/react/components/SidebarJobs';
import ConfigurationForm from './ConfigurationForm';


const COMPONENT_ID = 'keboola.ex-pigeon';

export default React.createClass({
  mixins: [createStoreMixin(...storeMixins, InstalledComponentStore, LatestJobsStore)],

  getStateFromStores() {
    const configId = RoutesStore.getCurrentRouteParam('config');
    const store = storeProvisioning(configId);
    const actions = actionsProvisioning(configId);

    return {
      configId: configId,
      store: store,
      actions: actions,
      latestJobs: LatestJobsStore.getJobs(COMPONENT_ID, configId),
      localState: store.getLocalState(),
      dirtyParameters: store.dirtyParameters
    };
  },
  render() {
    return (
      <div className="container-fluid">
        <div className="col-md-9 kbc-main-content">
          <div className="kbc-inner-content-padding-fix with-bottom-border">
            <ComponentDescription
              componentId={COMPONENT_ID}
              configId={this.state.configId}
            />
          </div>
          <div className="kbc-inner-content-padding-fix with-bottom-border">
            {this.renderButtons()}
            <br/>
            <h2>Pigeon configuration</h2>
            <ConfigurationForm
             updateDirtyParameters={this.state.actions.updateDirtyParameters}
             dirtyParameters={this.state.dirtyParameters}
             requestedEmail={this.state.store.requestedEmail}
            />
          </div>
        </div>
        <div className="col-md-3 kbc-main-sidebar">
          <ComponentMetadata
            configId={this.state.configId}
            componentId={COMPONENT_ID}
            />
            <ul className="nav nav-stacked">
             <li>
               <RunComponentButton
                 title="Run"
                 component={COMPONENT_ID}
                 mode="link"
                 runParams={() => ({config: this.state.configId})}
                 disabled={!!this.invalidToRun()}
                 disabledReason={this.invalidToRun()}
               >
                 <span>You are about to run an extraction.</span>
               </RunComponentButton>
             </li>
             <li>
               <DeleteConfigurationButton
                 componentId={COMPONENT_ID}
                 configId={this.state.configId}
               />
             </li>
            </ul>
              <LatestJobs
                jobs={this.state.latestJobs}
                limit={3}
                />
              <LatestVersions
                componentId={COMPONENT_ID}
              />
          </div>
      </div>
    );
  },
  renderButtons() {
    return (
      <div className="text-right">
        <SaveButtons
          isSaving={this.state.localState.get('isSaving', false)}
          isChanged={this.isConfigurationChanged()}
          onSave={this.state.actions.saveConfigData}
          onReset={this.state.actions.resetDirtyParameters}
          />
      </div>
    );
  },
  invalidToRun() {
    if (this.state.dirtyParameters.get('enclosure') +  this.state.dirtyParameters.get('delimiter') === '') {
      return 'Configuration has missing values';
    }
    return false;
  },
  isConfigurationChanged() {
    return !(this.state.dirtyParameters.equals(this.state.store.configData.get('parameters')));
  }
});