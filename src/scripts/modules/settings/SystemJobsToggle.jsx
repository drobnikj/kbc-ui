import React, {PropTypes} from 'react';
import {Map} from 'immutable';
import {Button} from 'react-bootstrap';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import ComponentsActionCreators from '../components/ComponentsActionCreators';
import InstalledComponentsActionCreators from '../components/InstalledComponentsActionCreators';
import OrchestrationsActionCreator from '../orchestrations/ActionCreators';
import OrchestrationsStore from '../orchestrations/stores/OrchestrationsStore';
import createStoreMixin from '../../react/mixins/createStoreMixin';

import SystemJobsModal from './SystemJobsModal';

const systemJobsOrchestrationName = 'KBC System Tasks';

export default React.createClass({

  mixins: [createStoreMixin(OrchestrationsStore)],

  displayName: 'System Jobs Toggle',

  propTypes: {
    sapiToken: PropTypes.string.isRequired,
    sapiUrl: PropTypes.string.isRequireds,
    components: PropTypes.array.isRequired,
    installedComponents: PropTypes.array.isRequired
  },

  getStateFromStores() {
    const orchestrations = OrchestrationsStore.getFiltered() || Map();
    let sysjobsEnabled = true;
    let sysjobsOrchestrationId = null;
    let buttonLabel = 'Disable';
    if (!orchestrations) {
      buttonLabel = 'Enable';
      sysjobsEnabled = false;
    } else {
      sysjobsOrchestrationId = orchestrations.keySeq().first();
    }
    return {
      sysjobsEnabled: sysjobsEnabled,
      sysjobsOrchestrationId: sysjobsOrchestrationId,
      buttonLabel: buttonLabel
    };
  },

  componentWillMount() {
    ApplicationActionCreators.receiveApplicationData({
      sapiToken: {'token': this.props.sapiToken},
      sapiUrl: this.props.sapiUrl
    });
    ComponentsActionCreators.receiveAllComponents(this.props.components);
    InstalledComponentsActionCreators.receiveAllComponents(this.props.installedComponents);
    OrchestrationsActionCreator.loadOrchestrationsForce();
    OrchestrationsActionCreator.setOrchestrationsFilter(systemJobsOrchestrationName);
  },

  getInitialState() {
    return {
      isOpen: false
    };
  },

  render() {
    return (
      <div>
        <Button bsStyle="success" onClick={this.openModal}>
          {this.state.buttonLabel}
          <SystemJobsModal
            systemJobsEnabled={this.state.sysjobsEnabled}
            systemJobsOrchestrationId={this.state.sysjobsOrchestrationId}
            onHide={this.closeModal}
            isOpen={this.state.isOpen}
          />
        </Button>
      </div>
    );
  },

  handleChange() {
    this.openModal();
  },

  openModal() {
    this.setState({
      isOpen: true
    });
  },

  closeModal() {
    this.setState({
      isOpen: false
    });
  }
});