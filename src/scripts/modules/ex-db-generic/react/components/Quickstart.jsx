import React from 'react';

import Immutable from 'immutable';
import {Loader} from 'kbc-react-components';
import Select from '../../../../react/common/Select';

export default React.createClass({
  displayName: 'Quickstart',
  propTypes: {
    configId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string,
    isLoadingSourceTables: React.PropTypes.bool.isRequired,
    sourceTables: React.PropTypes.object.isRequired,
    sourceTablesError: React.PropTypes.string,
    actionsProvisioning: React.PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      tables: Immutable.List()
    };
  },

  quickstart() {
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);

    ExDbActionCreators.quickstart(this.state.tables);
    this.transitionTo(
      this.props.componentId,
      {
        config: this.props.configId
      }
    );
  },

  handleTableSelectChange(newValue) {
    return this.setState({ tables: Immutable.fromJS(newValue)});
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

  getQuickstartValue() {
    if (this.state.tables.count() > 0) {
      return this.state.tables.map(function(table) {
        return table.get('tableName');
      }).toJS();
    } else {
      return '';
    }
  },

  render() {
    var tableSelector = (
      <div className="form-group">
        <Select
          multi={true}
          name="quickstart"
          value={this.getQuickstartValue()}
          placeholder="All columns will be imported"
          onChange={this.handleTableSelectChange}
          optionRenderer={this.optionRenderer}
          options={this.transformOptions(this.getTableOptions())}/>
        <button
          className="btn btn-success"
          onClick={this.quickstart}
        > Start me up
        </button>
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
