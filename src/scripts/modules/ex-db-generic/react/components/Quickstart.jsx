import React from 'react';

import Immutable from 'immutable';
import {Loader} from 'kbc-react-components';
import Select from 'react-select';

export default React.createClass({
  displayName: 'Quickstart',
  propTypes: {
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string,
    isLoadingSourceTables: React.PropTypes.bool.isRequired,
    sourceTables: React.PropTypes.object,
    sourceTablesError: React.PropTypes.string,
    quickstart: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired
  },

  quickstart() {
    this.props.onSubmit(this.props.configId, this.props.quickstart.get('tables'));
  },

  handleSelectChange(selected) {
    return this.props.onChange(this.props.configId, Immutable.fromJS(selected.map(function(table) {
      return table.value;
    })));
  },

  getTableOptions() {
    if (this.props.sourceTables && this.props.sourceTables.count() > 0) {
      const groupedTables = this.props.sourceTables.groupBy(table => table.get('schema'));
      return groupedTables.keySeq().map(function(group) {
        return {
          value: group,
          label: group,
          children: groupedTables.get(group).map(function(table) {
            return {
              value: {
                schema: table.get('schema'),
                tableName: table.get('name')
              },
              label: table.get('name')
            };
          }).toJS()
        };
      });
    } else {
      return [];
    }
  },

  getQuickstartValue(tables) {
    if (tables) {
      let jsTables = tables;
      if (tables.toJS) {
        jsTables = tables.toJS();
      }
      return jsTables.map(function(table) {
        return {
          label: table.tableName,
          value: table
        };
      });
    } else {
      return [];
    }
  },

  render() {
    var tableSelector = (
      <div className="form-group text-left">
        <div className="col-md-8">
          <Select
            multi={true}
            name="quickstart"
            value={this.getQuickstartValue(this.props.quickstart.get('tables'))}
            placeholder="Select tables to copy"
            onChange={this.handleSelectChange}
            optionRenderer={this.optionRenderer}
            options={this.transformOptions(this.getTableOptions())}/>
        </div>
        <div className="col-md-4">
          <button
            className="btn btn-success"
            onClick={this.quickstart}
          > Let's go!
          </button>
        </div>
      </div>
    );

    var loader = (
      <div className="form-control-static">
        <Loader/> Fetching table list from source database ...
      </div>
    );

    return (
      <div className="row text-center">
        {(this.props.isLoadingSourceTables) ? loader : tableSelector }
      </div>
    );
  },

  transformOptions(options) {
    const option = (value, label, render, disabled = false) => ({value, label, render, disabled});

    return options.reduce((acc, o) => {
      const parent = option(o.value, o.label, (<strong style={{color: '#000'}}>{o.label}</strong>), true);
      const children = o.children.map(c => option(c.value, c.label, <div>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  }

});
