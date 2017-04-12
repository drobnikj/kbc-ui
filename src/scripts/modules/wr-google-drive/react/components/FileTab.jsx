import React, {PropTypes} from 'react';
import {Input} from 'react-bootstrap';
import RadioGroup from 'react-radio-group';
import Picker from '../../../google-utils/react/GooglePicker';
import ViewTemplates from '../../../google-utils/react/PickerViewTemplates';

export default React.createClass({
  propTypes: {
    onSelectExisting: PropTypes.func.isRequired,
    onSelectFolder: PropTypes.func.isRequired,
    onChangeTitle: PropTypes.func.isRequired,
    onSwitchType: PropTypes.func.isRequired,
    valueTitle: PropTypes.string.isRequired,
    valueFolder: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['new', 'existing']),
    action: PropTypes.oneOf(['create', 'update']),
    show: PropTypes.bool.isRequired
  },

  render() {
    const radio = (this.props.action === 'create') ? null : this.renderTypeRadio();
    const picker = (this.props.type === 'new') ? this.renderFolderPicker() : this.renderFilePicker();
    return (
      <div className="form-horizontal">
      {radio}
      {picker}
      </div>
    );
  },

  renderTypeRadio() {
    return (
      <div className="row">
        <div className="form-group">
          <label className="col-md-2 control-label">
            Does the File already exist?
          </label>
          <div className="col-md-10">
            <RadioGroup
              name="type"
              value={this.props.type}
              onChange={this.props.onSwitchType}
            >
              <Input
                type="radio"
                label="No"
                help="Create a new File, that will be updated on each run"
                wrapperClassName="col-sm-8"
                value="new"
              />
              <Input
                type="radio"
                label="Yes"
                help="Use existing File"
                wrapperClassName="col-sm-8"
                value="existing"
              />
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  },

  renderFilePicker() {
    return (
      <div className="row">
        <div className="form-group">
          <label className="col-md-2 control-label">
            File
          </label>
          <div className="col-md-10">
            <Picker
              dialogTitle="Select File"
              buttonLabel={this.props.valueTitle ? this.props.valueTitle : 'Select File'}
              onPickedFn={this.props.onSelectExisting}
              buttonProps={{
                bsStyle: 'default',
                bsSize: 'large'
              }}
              views={[
                ViewTemplates.files,
                ViewTemplates.sharedFiles,
                ViewTemplates.starredFiles
              ]}
              multiselectEnabled={false}
            />
            <span className="help-block">
              Choose File you wish to update
            </span>
          </div>
        </div>
      </div>
    );
  },

  renderFolderPicker() {
    return (
      <div className="row">
        <div className="form-group">
          <label className="col-md-2 control-label">
            File
          </label>
          <div className="col-md-10">
            <div className="input-group">
              <div className="input-group-btn">
                <Picker
                  dialogTitle="Select Folder"
                  buttonLabel={this.props.valueFolder}
                  onPickedFn={this.props.onSelectFolder}
                  buttonProps={{
                    bsStyle: 'default',
                    bsSize: 'large'
                  }}
                  views={[
                    ViewTemplates.rootFolder,
                    ViewTemplates.sharedFolders,
                    ViewTemplates.starredFolders
                  ]}
                  multiselectEnabled={false}
                />
              </div>
              <input
                placeholder="New File"
                type="text"
                value={this.props.valueTitle ? this.props.valueTitle : ''}
                onChange={this.props.onChangeTitle}
                className="form-control"
              />
            </div>
            <span className="help-block">
              Select Files parent <strong>folder</strong> and enter <strong>title</strong> of the File.<br/>
              {this.props.action === 'create' ? 'The File will be created on next run. Current date and time will be appended to Files name.' : 'The File will be created upon save.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

});