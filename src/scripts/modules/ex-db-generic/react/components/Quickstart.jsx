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
    actionsProvisioning: React.PropTypes.object.isRequired,
    tables: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      tables: Immutable.List()
    };
  },

  quickstart() {
    const ExDbActionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);

    let query = ExDbActionCreators.createQuery(this.props.configId);
    this.transitionTo(
      'ex-db-generic-' + this.props.componentId + '-query',
      {
        config: this.props.configId,
        query: query.get('id')
      }
    );
  },

  handleTableSelectChange(newValue) {
    this.props.tables = Immutable.fromJS(newValue);
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
    if (this.props.tables.count() > 0) {
      return this.props.tables.getIn(['tableName']).toJS();
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
          onClic={this.quickstart}
        > Let's go
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
      const children = o.children.map(c => option(c.value, c.label, <div style={{paddingLeft: 10}}>{c.label}</div>));

      return acc.concat(parent).concat(children);
    }, []);
  },

  optionRenderer(option) {
    return option.render;
  }

});
