React = require 'react'

Modal = React.createFactory(require('react-bootstrap').Modal)
ModalHeader = React.createFactory(require('react-bootstrap').Modal.Header)
ModalTitle = React.createFactory(require('react-bootstrap').Modal.Title)
ModalBody = React.createFactory(require('react-bootstrap').Modal.Body)
ModalFooter = React.createFactory(require('react-bootstrap').Modal.Footer)
ButtonToolbar = React.createFactory(require('react-bootstrap').ButtonToolbar)
Button = React.createFactory(require('react-bootstrap').Button)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
SqlDepAnalyzerApi = require '../../../sqldep-analyzer/Api'

{div, p, a, strong, code, span, i} = React.DOM


SqlDepModal = React.createClass
  displayName: 'SqlDepModal'

  getInitialState: ->
    isLoading: true
    sqlDepUrl: null
    showModal: false

  close: ->
    @setState
      showModal: false
      isLoading: false

  open: ->
    @setState
      showModal: true

    if (@props.backend == 'redshift' || @props.backend == 'snowflake')
      @setState
        isLoading: true
      component = @
      SqlDepAnalyzerApi
      .getGraph(@props.bucketId, @props.transformationId)
      .then((response) ->
        component.setState
          isLoading: false
          sqlDepUrl: response.get('url')
      )

  betaWarning: ->
    if (@props.backend == 'snowflake')
      span null,
        ' '
        span className: 'label label-info',
          'BETA'

  render: ->
    a onClick: @handleOpenButtonClick,
      i className: 'fa fa-sitemap fa-fw'
      ' SQLDep'
      @betaWarning()
      Modal
        show: @state.showModal
        onHide: @close
      ,
        ModalHeader closeButton: true,
          ModalTitle null,
            'SQLDep'

        ModalBody null,
          @_renderBody()

        ModalFooter null,
          ButtonToolbar null,
            Button
              onClick: @close
              bsStyle: 'link'
            ,
              'Close'

  handleOpenButtonClick: (e) ->
    e.preventDefault()
    @open()

  _renderBody: ->
    if @props.backend == 'redshift' || @props.backend == 'snowflake'
      if @state.isLoading
        p null,
          Loader {}
          ' '
          'Loading SQLdep data. This may take a minute or two...'
      else if !@state.isLoading
        span {},
          p {},
            'SQLdep is ready. '
            a {href: @state.sqlDepUrl, target: '_blank'},
              'Open SQLDep '
              i className: 'fa fa-external-link'
    else
      [
        p {},
          'Visual SQL analysis is available for Redshift transformations only. ',
        p {},
          'Contact '
          a {href: 'mailto:support@keboola.com'}, 'support@keboola.com'
          ' for more information.'
      ]

  _handleConfirm: ->
    @close()
    @props.onConfirm()

module.exports = SqlDepModal
