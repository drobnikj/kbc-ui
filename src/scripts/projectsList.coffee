###
  Mock page for projects list development
  Not used in production

###

React = require 'react'
ReactDOM = require 'react-dom'
Immutable = require 'immutable'
{div, span, ul, li, input, a} = React.DOM

CurrentUser = require('./react/layout/CurrentUser').default
ProjectsList = require './react/layout/project-select/List'

App = React.createClass
  render: ->
    div className: 'kbc-outer-container',
      div className: 'kbc-outer-logo',
        span className: 'kbc-icon-keboola-logo'
        span className: 'kbc-notification',
          a null,
            span className: "kbc-notification-icon fa fa-bell",
              span className: "kbc-notification-icon-badge",
                span className: "kbc-notification-icon-badge-inner"

        React.createElement CurrentUser,
          user: @props.user
          maintainers: @props.maintainers
          urlTemplates: @props.urlTemplates
          canManageApps: true
          dropup: false
      div className: 'kbc-outer-content well',
        React.createElement ProjectsList,
          organizations: @props.organizations
          urlTemplates: @props.urlTemplates
          projectTemplates: @props.projectTemplates
          focus: true
          canCreateProject: @props.canCreateProject


global.kbcApp =
  start: (appOptions) ->
    document.body.className = 'kbc-outer-page kbc-projects-list'
    ReactDOM.render(React.createElement(App,
      user: Immutable.fromJS(appOptions.data.kbc.admin)
      urlTemplates: Immutable.fromJS(appOptions.data.kbc.urlTemplates)
      projectTemplates: Immutable.fromJS(appOptions.data.projectTemplates),
      maintainers: Immutable.fromJS(appOptions.data.maintainers)
      organizations: Immutable.fromJS(appOptions.data.organizations)
      canCreateProject: appOptions.data.kbc.canCreateProject
    ), document.body)

  helpers: require './helpers'
