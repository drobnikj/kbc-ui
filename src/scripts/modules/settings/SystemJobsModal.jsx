import React, {PropTypes} from 'react';
import {Modal, ButtonToolbar, Button} from 'react-bootstrap';
import ApplicationStore from '../../stores/ApplicationStore';
import OrchestrationsApi from '../orchestrations/OrchestrationsApi';

const systemJobsOrchestrationName = 'KBC System Tasks';

const systemMetadataGathererTask = {
  'component': 'keboola.metadata-gatherer',
  'componentUrl': null,
  'action': 'run',
  'actionParameters': {
    'configData': {
      'parameters': {
        'writers': '*',
        'transformation': '*'
      }
    }
  }
};
const systemJobsErrorNotification = {
  'email': 'support@keboola.com',
  'channel': 'error',
  'parameters': {}
};


export default React.createClass({
  propTypes: {
    systemJobsEnabled: PropTypes.bool.isRequired,
    systemJobsOrchestrationId: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      isSaving: false,
      xsrf: ApplicationStore.getXsrfToken()
    };
  },

  render() {
    const {systemJobs, isOpen, onHide} = this.props;
    let modalText = 'Please note that this will result in the removal of some features,' +
                    ' please see the help documentation for further info.';
    let submitButtonText = 'Disable';
    if (systemJobsEnabled) {
      modalText = 'Enabling system jobs will give you access to some advanced features,' +
                  ' please see the help documentation for further info.';
      submitButtonText = 'Enable';
    }
    return (
      <Modal show={isOpen} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>KBC System Jobs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>
              {modalText}
            </p>
        </Modal.Body>
        <Modal.Footer>
          <ButtonToolbar>
            <Button onClick={onHide} bsStyle="link">
              Cancel
            </Button>
            <Button bsStyle="primary" onClick={this.handleSave} disabled={this.state.isSaving}>
              {submitButtonText}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  handleSave() {
    if (this.props.systemJobsEnabled) {
      this.disableSystemJobs();
    } else {
      this.enableSystemJobs();
    }
    this.setState({
      isSaving: true
    });
  },

  disableSystemJobs() {
    OrchestrationsApi.deleteOrchestration(this.props.systemJobsOrchestrationId)
  },

  enableSystemJobs() {
    curDate = new Date();
    OrchestrationsApi.createOrchestration({
      name: systemJobsOrchestrationName,
      crontabRecord: curDate.getMinutes() + " " + curDate.getHours() + " * * *",
      tasks: [
        systemMetadataGathererTask
      ],
      notifications: [
        systemJobsErrorNotification
      ]
    });
  }
});
