React = require 'react'
RouteHandler = React.createFactory(require('react-router').RouteHandler)
ApplicationStore = require '../../stores/ApplicationStore'

Header = React.createFactory(require '././Header')
SidebarNavigation = React.createFactory(require('././SidebarNavigation').default)
FloatingNotifications = require('./FloatingNotifications').default
ErrorPage = React.createFactory(require './../pages/ErrorPage')
LoadingPage = React.createFactory(require './../pages/LoadingPage')
ProjectSelect = React.createFactory(require('./project-select/ProjectSelect').default)
PageTitle = React.createFactory(require './PageTitle')
Wizard =  React.createFactory(require('../../modules/try-mode/react/Wizard'))
WizardStore = require('../../modules/try-mode/stores/WizardStore').default
DisableTryMode = require('../../modules/try-mode/stores/ActionCreators').disableTryMode

CurrentUser = React.createFactory(require('./CurrentUser').default)
UserLinks = React.createFactory(require './UserLinks')
PoweredByKeboola = React.createFactory(require './PoweredByKeboola')
classnames = require('classnames')

{div, a, i, p} = React.DOM

require '../../../styles/app.less'

App = React.createClass
  displayName: 'App'
  propTypes:
    isError: React.PropTypes.bool
    isLoading: React.PropTypes.bool
  getInitialState: ->
    organizations: ApplicationStore.getOrganizations()
    maintainers: ApplicationStore.getMaintainers()
    notifications: ApplicationStore.getNotifications()
    currentProject: ApplicationStore.getCurrentProject()
    currentAdmin: ApplicationStore.getCurrentAdmin()
    urlTemplates: ApplicationStore.getUrlTemplates()
    projectTemplates: ApplicationStore.getProjectTemplates()
    xsrf: ApplicationStore.getXsrfToken()
    canCreateProject: ApplicationStore.getCanCreateProject()
    canManageApps: ApplicationStore.getKbcVars().get 'canManageApps'
    projectHasTryModeOn: ApplicationStore.getKbcVars().get 'projectHasTryModeOn'
    homeUrl: ApplicationStore.getUrlTemplates().get 'home'
    projectFeatures: ApplicationStore.getCurrentProjectFeatures()
  render: ->
    div className: classnames(
      snowflake: ApplicationStore.hasCurrentProjectFeature('ui-snowflake-demo')
    ),
      if @state.projectHasTryModeOn == true
        div className: 'try-status-bar',
          p null,
            'Try Mode'
          p null,
            ' — learn everything you need to know about Keboola Connection'
          a href: ApplicationStore.getProjectPageUrl('settings'),
            'Disable Try Mode \xa0',
            i className: 'fa fa-times',
      PageTitle()
      Header
        homeUrl: @state.homeUrl
        notifications: @state.notifications
      React.createElement(FloatingNotifications)
      div className: 'container-fluid',
        div className: 'row',
          div className: 'col-xs-3 kbc-sidebar',
            ProjectSelect
              organizations: @state.organizations
              currentProject: @state.currentProject
              urlTemplates: @state.urlTemplates
              xsrf: @state.xsrf
              canCreateProject: @state.canCreateProject
              projectTemplates: @state.projectTemplates
            SidebarNavigation()
            div className: 'kbc-sidebar-footer',
              CurrentUser
                user: @state.currentAdmin
                maintainers: @state.maintainers
                urlTemplates: @state.urlTemplates
                canManageApps: @state.canManageApps
                dropup: true
              UserLinks()
              PoweredByKeboola()
          div className: 'col-xs-9 col-xs-offset-3 kbc-main',
            if @props.isError
              ErrorPage()
            else if @props.isLoading
              LoadingPage()
            else
              RouteHandler()
            if @state.projectHasTryModeOn == true
              Wizard()

module.exports = App
