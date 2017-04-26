import React, {PropTypes} from 'react';
import Immutable from 'immutable';
import {Button} from 'react-bootstrap';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import ComponentsActionCreators from '../components/ComponentsActionCreators';
import OrchestrationsApi from '../orchestrations/OrchestrationsApi';

/*
import OrchestrationsStore from '../orchestrations/stores/OrchestrationsStore';
*/

import SystemJobsModal from './SystemJobsModal';

const systemJobsOrchestrationName = 'KBC System Tasks';

export default React.createClass({
  displayName: 'System Jobs Toggle',

  propTypes: {
    sapiToken: PropTypes.string.isRequired
  },

  getInitialState() {
    ApplicationActionCreators.receiveApplicationData({
      sapiToken: this.props.sapiToken
    });
    ComponentsActionCreators.receiveAllComponents(
      [{ id: 'orchestrator', url: 'https://syrup.keboola.com/orchestrator'}]
    );
    if (this.projectHasSystemOrchestration()) {
      return {
        isOpen: false,
        buttonLabel: 'Disable'
      };
    } else {
      return {
        isOpen: false,
        buttonLabel: 'Enable'
      };
    }
  },

  render() {
    return (
      <Button bsStyle="success" onClick={this.openModal}>
        <span className="kbc-icon-pencil"/> {this.state.buttonLabel}
        <SystemJobsModal
          systemJobsEnabled={!this.projectHasSystemOrchestration()}
          onHide={this.closeModal}
          isOpen={this.state.isOpen}
        />
      </Button>
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
  },

  projectHasSystemOrchestration() {
    let orchestrations = new Immutable.List(OrchestrationsApi.getOrchestrations());
    if (orchestrations.hasIn('name', systemJobsOrchestrationName)) {
      return true;
    } else {
      return false;
    }
  }
});