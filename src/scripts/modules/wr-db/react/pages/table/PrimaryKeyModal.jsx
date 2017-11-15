import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {fromJS} from 'immutable';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../../../react/common/ConfirmButtons';
import Select from 'react-select';

export default React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    columns: PropTypes.object.isRequired,
    currentValue: PropTypes.object.isRequired,
    tableConfig: PropTypes.object.isRequired,
    onSave: React.PropTypes.func.isRequired,
    onHide: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired,
    isSaving: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return this.getStateFromProps(this.props);
  },

  getStateFromProps(props) {
    return {
      value: props.currentValue
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.isSaving) return;
    this.setState(this.getStateFromProps(nextProps));
  },


  isValid() {
    const val = this.state.value;
    return !!val;
  },

  render() {
    let formDivClass = 'form-group form-group-sm';
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {`Primary key of destination table ${this.props.tableConfig.get('dbName')}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form form-horizontal">
            <div className={formDivClass}>
              <label htmlFor="title" className="col-sm-3 control-label">
                Primary Key
              </label>
              <div className="col-sm-9">
                <Select
                  placeholder="select from database column names"
                  clearable={false}
                  key="primary key select"
                  name="pkelector"
                  multi={true}
                  value={this.state.value}
                  onChange= {(newValue) => this.setState({value: newValue})}
                  options= {this.getColumns()}
                />
                {/* <span className="help-block">
                    Specify primary key of the resulting table
                    </span> */}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveLabel="Save"
            isSaving={this.props.isSaving}
            isDisabled={false}
            onCancel={this.closeModal}
            onSave={this.handleSave}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  getColumns() {
    const result = this.props.columns.map((key) => {
      return {
        'label': key,
        'value': key
      };
    }).toList().toJS();
    return result;
  },

  closeModal() {
    this.setState({
      value: null
    });
    this.props.onHide();
  },

  handleSave() {
    let pkToSave = [];
    pkToSave = this.state.value ? this.state.value.map(o => o.value) : [];
    this.props.onSave(fromJS(pkToSave)).then(() =>
      this.closeModal()
    );
  }

});
