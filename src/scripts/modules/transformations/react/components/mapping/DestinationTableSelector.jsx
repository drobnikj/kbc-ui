import React, {PropTypes} from 'react';
import Select from 'react-select';
import {FormControl} from 'react-bootstrap';


export default React.createClass({
  propTypes: {
    onSelect: PropTypes.func.isRequired,
    value: PropTypes.string,
    disabled: PropTypes.bool.isRequired
  },

  parseValue() {
    const value = this.props.value || '';
    const parts = value.match(/^(in|out)\.(.+)?\.(.+)?$/);
    return {
      stage: parts ? parts[1] : 'out',
      bucket: parts ? (parts[2] || '') : '',
      table: parts ? (parts[3] || '') : ''
    };
  },

  render() {
    const parsed = this.parseValue();
    return (
      <span className="col-sm-12">
        <Select
          searchable={false}
          disabled={this.props.disabled}
          clearable={false}
          value={parsed.stage}
          onChange={({value}) => this.selectState(value)}
          options={['out', 'in'].map(v => ({label: v, value: v}))}
        />
        <span>.</span>
        <Select.Creatable
          clearable={true}
          disabled={this.props.disabled}
          placeholder="Select bucket or create new"
          value={parsed.bucket}
          onChange={({value}) => this.selectBucket(value)}
          options={[]}
        />
        <span>.</span>
        <FormControl
          type="text"
          componentClass="input"
          value={parsed.table}
          onChange={({target})=> this.changeTable(target.value)}
        />
      </span>
    );
  },

  selectState(stage) {
    this.updateValue('stage', stage);
  },

  selectBucket(bucket) {
    this.updateValue('bucket', bucket);
  },

  changeTable(tableName) {
    this.updateValue('table', tableName);
  },

  updateValue(partNameToUpdate, value) {
    const parsedParts = this.parseValue();
    const result = ['stage', 'bucket', 'table']
      .reduce((memo, partName) =>
        partName === partNameToUpdate ? `${memo}.${value}` : `${memo}.${parsedParts[partName]}`, '').slice(1);
    this.props.onSelect(result);
  }

});
