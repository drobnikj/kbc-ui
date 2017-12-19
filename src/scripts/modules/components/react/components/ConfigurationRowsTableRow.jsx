import React from 'react';
import ImmutableRenderMixin from '../../../../react/mixins/ImmutableRendererMixin';
import ActivateDeactivateButton from '../../../../react/common/ActivateDeactivateButton';
import DeleteConfigurationRowButton from './DeleteConfigurationRowButton';
import RunComponentButton from './RunComponentButton';
import {Link} from 'react-router';

export default React.createClass({
  displayName: 'ConfigurationRowsTableRow',

  mixins: [ImmutableRenderMixin],

  propTypes: {
    componentId: React.PropTypes.string.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    row: React.PropTypes.object.isRequired,
    columns: React.PropTypes.array.isRequired,
    linkTo: React.PropTypes.string.isRequired,
    isDeletePending: React.PropTypes.bool.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    isEnableDisablePending: React.PropTypes.bool.isRequired,
    onEnableDisable: React.PropTypes.func.isRequired
  },

  render() {
    const props = this.props;
    return (
      <Link to={this.props.linkTo} params={{config: this.props.configurationId, row: this.props.row.get('id')}} className="tr">
        {this.props.columns.map(function(columnFunction, columnIndex) {
          return (
            <div className="td kbc-break-all" key={columnIndex}>
              {columnFunction(props.row)}
            </div>
          );
        })}
        <div className="td text-right kbc-no-wrap">
          {this.renderRowActionButtons()}
        </div>
      </Link>
    );
  },


  renderRowActionButtons() {
    const props = this.props;
    return [
      (<DeleteConfigurationRowButton
        key="delete"
        isPending={this.props.isDeletePending}
        onClick={this.props.onDelete}
      />),
      (<ActivateDeactivateButton
        key="activate"
        activateTooltip="Enable"
        deactivateTooltip="Disable"
        isActive={!this.props.row.get('isDisabled', false)}
        isPending={this.props.isEnableDisablePending}
        onChange={this.props.onEnableDisable}
      />),
      (<RunComponentButton
        key="run"
        title="Run"
        component={this.props.componentId}
        runParams={function() {
          return {
            config: props.configurationId,
            row: props.row.get('id')
          };
        }}
      >
          {this.renderRunModalContent()}
        </RunComponentButton>
      )
    ];
  },

  renderRunModalContent() {
    const rowName = this.props.row.get('name', 'Untitled');
    if (this.props.row.get('isDisabled')) {
      return 'You are about to run ' + rowName + '. Configuration ' + rowName + ' is disabled and will be forced to run ';
    } else {
      return 'You are about to run ' + rowName + '.';
    }
  }
});
