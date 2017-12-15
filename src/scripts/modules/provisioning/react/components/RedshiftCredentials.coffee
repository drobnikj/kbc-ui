React = require 'react'

Protected = React.createFactory(require('@keboola/indigo-ui').Protected)
Clipboard = React.createFactory(require('../../../../react/common/Clipboard').default)
Loader = React.createFactory(require('@keboola/indigo-ui').Loader)
Input = React.createFactory(require('./../../../../react/common/KbcBootstrap').Input)

{a, span, div, strong, small} = React.DOM

RedshiftCredentials = React.createClass
  displayName: 'RedshiftCredentials'
  propTypes:
    credentials: React.PropTypes.object
    isCreating: React.PropTypes.bool

  getInitialState: ->
    showDetails: false

  render: ->
    div {},
      if @props.isCreating
        span {},
          Loader()
          ' Creating sandbox'
      else
        if @props.credentials.get "id"
          @_renderCredentials()

        else
          'Sandbox not running'

  _renderCredentials: ->
    jdbcRedshift = 'jdbc:redshift://' + @props.credentials.get("hostname") + ':5439/' + @props.credentials.get("db")
    jdbcPgSql = 'jdbc:postgresql://' + @props.credentials.get("hostname") + ':5439/' + @props.credentials.get("db")
    span {},
      div {className: 'row'},
        div className: 'col-md-12',
          small className: 'help-text',
            'Use these credentials to connect to the sandbox with your \
            favourite Redshift client (we like '
            a {href: 'http://dbeaver.jkiss.org/download/', target: '_blank'},
              'DBeaver'
            ').'
      div {className: 'row'},
        span {className: 'col-md-3'}, 'Host'
        strong {className: 'col-md-9'},
          @props.credentials.get "hostname"
          Clipboard text: @props.credentials.get "hostname"
      div {className: 'row'},
        span {className: 'col-md-3'}, 'Port'
        strong {className: 'col-md-9'},
          '5439'
          Clipboard text: '5439'
      div {className: 'row'},
        span {className: 'col-md-3'}, 'User'
        strong {className: 'col-md-9'},
          @props.credentials.get "user"
          Clipboard text: @props.credentials.get "user"
      div {className: 'row'},
        span {className: 'col-md-3'}, 'Password'
        strong {className: 'col-md-9'},
          Protected {},
            @props.credentials.get "password"
          Clipboard text: @props.credentials.get "password"
      div {className: 'row'},
        span {className: 'col-md-3'}, 'Database'
        strong {className: 'col-md-9'},
          @props.credentials.get "db"
          Clipboard text: @props.credentials.get "db"
      div {className: 'row'},
        span {className: 'col-md-3'}, 'Schema'
        strong {className: 'col-md-9'},
          @props.credentials.get "schema"
          Clipboard text: @props.credentials.get "schema"
      div {className: 'form-horizontal clearfix'},
        div {className: "row"},
          div className: 'form-group-sm',
            span {className: 'col-md-3'}, ''
              div className: 'col-md-9',
                Input
                  standalone: true
                  type: 'checkbox'
                  label: small {}, 'Show JDBC strings'
                  checked: @state.showDetails
                  onChange: @_handleToggleShowDetails
      if @state.showDetails
        div {className: 'row'},
          span {className: 'col-md-3'}, 'Redshift driver'
          strong {className: 'col-md-9'},
            jdbcRedshift
            Clipboard text: jdbcRedshift
      if @state.showDetails
        div {className: 'row'},
          span {className: 'col-md-3'}, 'PostgreSQL driver'
          strong {className: 'col-md-9'},
            jdbcPgSql
            Clipboard text: jdbcPgSql

  _handleToggleShowDetails: (e) ->
    @setState(
      showDetails: e.target.checked
    )

module.exports = RedshiftCredentials
