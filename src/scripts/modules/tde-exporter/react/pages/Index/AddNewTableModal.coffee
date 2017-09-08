React = require 'react'
{ModalFooter, Modal, ModalHeader, ModalTitle, ModalBody} = require('react-bootstrap')
SapiTableSelector = require('../../../../components/react/components/SapiTableSelector').default
ConfirmButtons = require('../../../../../react/common/ConfirmButtons').default

module.exports = React.createClass

  displayName: 'AddNewTableModal'

  propTypes:
    show: React.PropTypes.bool
    onHideFn: React.PropTypes.func
    selectedTableId: React.PropTypes.string
    onSetTableIdFn: React.PropTypes.func
    configuredTables: React.PropTypes.object
    onSaveFn: React.PropTypes.func

  render: ->
    React.createElement Modal,
      show: @props.show
      onHide: =>
        @props.onHideFn()
      React.createElement ModalHeader, {closeButton: true},
        React.createElement  ModalTitle, null, 'Add Table'
      React.createElement ModalBody, null,
        React.createElement SapiTableSelector,
          value: @props.selectedTableId
          onSelectTableFn: @props.onSetTableIdFn
          excludeTableFn: (tableId) =>
            hasIn = !! @props.configuredTables?.get(tableId)
            hasIn
      React.createElement ModalFooter, null,
        React.createElement ConfirmButtons,
          isSaving: false
          isDisabled: not !! @props.selectedTableId
          cancelLabel: 'Cancel'
          saveLabel: 'Select'
          onCancel: =>
            @props.onHideFn()
          onSave: =>
            @props.onSaveFn(@props.selectedTableId)
            @props.onHideFn()
