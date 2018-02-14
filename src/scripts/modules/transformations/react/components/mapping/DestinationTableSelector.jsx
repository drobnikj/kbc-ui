import React, {PropTypes} from 'react';
import Select from 'react-select';
// import {HelpBlock} from 'react-bootstrap';
// import storageActions from '../../../../components/StorageActionCreators';
import './DestinationTableSelector.less';

export default React.createClass({
  propTypes: {
    value: PropTypes.string,
    disabled: PropTypes.bool.isRequired,
    tables: React.PropTypes.object.isRequired,
    buckets: React.PropTypes.object.isRequired,
    parts: React.PropTypes.object.isRequired,
    updatePart: PropTypes.func.isRequired
  },

  /* componentDidMount() {
   *   storageActions.loadTablesForce();
   * },*/

  prepareBucketsOptions() {
    const stage = this.props.parts.stage;
    const bucket = this.props.parts.bucket;
    const buckets = this.props.buckets
                        .filter(b => b.get('stage') === stage)
                        .map(b => ({label: b.get('name'), value: b.get('name')}))
                        .toList();
    if (!!bucket && !buckets.find(b => b.label === bucket)) {
      return buckets.push({label: bucket, value: bucket});
    } else {
      return buckets;
    }
  },

  prepareTablesOptions() {
    const parts = this.props.parts;
    const bucketId = parts.stage + '.' + parts.bucket;
    const table = parts.table;
    const tables = this.props.tables
                       .filter(t => t.getIn(['bucket', 'id']) === bucketId)
                       .map(t => ({label: t.get('name'), value: t.get('name')}))
                       .toList();
    if (!!table && !tables.find(t => t.label === table)) {
      return tables.push({label: table, value: table});
    } else {
      return tables;
    }
  },

  render() {
    const parts = this.props.parts;
    const stageSelect = (
      <Select
        searchable={false}
        disabled={this.props.disabled}
        clearable={false}
        value={parts.stage}
        onChange={({value}) => this.selectStage(value)}
        options={['out', 'in'].map(v => ({label: v, value: v}))}
      />
    );
    const bucketSelect = (
      <Select.Creatable
        promptTextCreator={label => `Create new bucket ${label.startsWith('c-') ? '' : 'c-'}${label}`}
        clearable={true}
        disabled={this.props.disabled}
        placeholder="Select bucket or create new"
        value={parts.bucket}
        onChange={this.selectBucket}
        options={this.prepareBucketsOptions().toJS()}
      />
    );

    const tableSelect = (
      <Select.Creatable
        promptTextCreator={label => `Create new table ${label}`}
        clearable={true}
        disabled={this.props.disabled}
        placeholder="Select table or create new"
        value={parts.table}
        onChange={this.selectTable}
        options={this.prepareTablesOptions().toJS()}
      />
    );

    return (
      <span className="kbc-dst-table-selector">
        <div>
          <span className="col-md-1 kbc-select">
            {stageSelect}
          </span>
          <span className="col-md-1 kbc-dot-separator">
            {/* <i className="fa fa-circle" /> */}
            .
          </span>
          <span className="col-md-5 kbc-select">
            {bucketSelect}
          </span>
          <span className="col-md-1 kbc-dot-separator">
            .
          </span>
          <span className="col-md-5 kbc-select-table" >
            {tableSelect}
          </span>
        </div>
          <div className="help-block"> Destination is table in storage - you can create new one or use existing.</div>
      </span>
    );
  },

  selectStage(stage) {
    this.updateValue('stage', stage);
  },

  selectBucket(selection) {
    const bucket = selection ? selection.value : '';
    if (!!bucket &&
        !bucket.startsWith('c-') &&
        !this.prepareBucketsOptions().find(b => b.label === bucket)) {
      this.updateValue('bucket', 'c-' + bucket);
    } else {
      this.updateValue('bucket', bucket);
    }
  },

  selectTable(selection) {
    const tableName = selection ? selection.value : '';
    this.updateValue('table', tableName);
  },

  updateValue(partNameToUpdate, value) {
    this.props.updatePart(partNameToUpdate, value);
  }

});
