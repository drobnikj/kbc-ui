import React from 'react';
import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import immutableMixin from '../../../../react/mixins/ImmutableRendererMixin';
import Store  from '../../stores/ConfigurationRowsStore';
import date from '../../../../utils/date';

module.exports = React.createClass({
  displayName: 'ConfigurationRowMetadata',
  mixins: [createStoreMixin(Store), immutableMixin],
  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    rowId: React.PropTypes.string.isRequired
  },
  getStateFromStores: function() {
    return {
      row: Store.get(this.props.componentId, this.props.configurationId, this.props.rowId)
    };
  },
  render: function() {
    return (
      <div>
        <div>
          Created by
          {' '}
          <strong>{this.state.row.getIn(['creatorToken', 'description'])}</strong>
          {' '}
          <small>on <strong>{date.format(this.state.row.get('created'))}</strong></small>
        </div>
      </div>
    );
  }
});

// ---
// generated by coffee-script 1.9.2