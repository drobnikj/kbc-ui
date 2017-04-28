import React, {PropTypes} from 'react';
import {Modal, ButtonToolbar, Button} from 'react-bootstrap';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import OrchestrationsActionCreator from '../orchestrations/ActionCreators';

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
    sysjobsEnabled: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    sysjobsOrchestrationId: PropTypes.string
  },

  render() {
    const {sysjobsEnabled, isOpen, onHide} = this.props;
    let modalText = 'Please note that this will result in the removal of some features.';
    let submitButtonText = 'Disable';
    if (sysjobsEnabled) {
      modalText = 'Enabling system jobs will give you access to some advanced features.';
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
            <Button bsStyle="primary" onClick={this.handleSave}>
              {submitButtonText}
            </Button>
          </ButtonToolbar>
        </Modal.Footer>
      </Modal>
    );
  },

  handleSave() {
    if (this.props.sysjobsEnabled) {
      this.disableSystemJobs();
      ApplicationActionCreators.sendNotification({
        message: 'Removed KBC System Tasks Orchestration'
      });
    } else {
      this.enableSystemJobs();
      ApplicationActionCreators.sendNotification({
        message: 'Created KBC System Tasks Orchestration'
      });
    }
    this.props.onHide();
  },

  disableSystemJobs() {
    OrchestrationsActionCreator.deleteOrchestration(this.props.sysjobsOrchestrationId);
  },

  enableSystemJobs() {
    let curDate = new Date();
    OrchestrationsActionCreator.createOrchestration({
      name: systemJobsOrchestrationName,
      crontabRecord: curDate.getMinutes() + ' ' + curDate.getHours() + ' * * *',
      tasks: [
        systemMetadataGathererTask
      ],
      notifications: [
        systemJobsErrorNotification
      ]
    });
  }
});
