React = require 'react'
ComponentIcon = React.createFactory(require('../../../../../react/common/ComponentIcon'))
ComponentName = React.createFactory(require('../../../../../react/common/ComponentName'))

{div, h2, a, ul, li, i} = React.DOM

ConfigurationSelect = React.createClass
  displayName: 'ConfigurationSelect'
  propTypes:
    component: React.PropTypes.object.isRequired
    onReset: React.PropTypes.func.isRequired
    onConfigurationSelect: React.PropTypes.func.isRequired

  render: ->
    div null,
      h2 null,
        ComponentIcon component: @props.component
        ' '
        ComponentName component: @props.component
        a className: 'pull-right', onClick: @_handleBack,
          span className: 'fa fa-chevron-left', null,
            ' Back'
      ul className: 'list-group',
        @props.component.get('configurations').map((configuration) ->
          li className: 'list-group-item', key: configuration.get('id'),
            configuration.get('name')
            i className: 'fa fa-plus', onClick: @_handleSelect.bind(@, configuration)
        , @).toArray()

  _handleBack: ->
    @props.onReset()

  _handleSelect: (configuration) ->
    @props.onConfigurationSelect(configuration)


module.exports = ConfigurationSelect
