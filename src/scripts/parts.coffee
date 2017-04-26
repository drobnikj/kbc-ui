###
  Entry point for non app pages, provides some basic parts implemented in React
###

require './utils/react-shim'

global.kbcApp =
  helpers: require './helpers'
  parts:
    ProjectSelect: require('./react/layout/project-select/ProjectSelect').default
    CurrentUser: require('./react/layout/CurrentUser').default
    ProjectsList: require './react/layout/project-select/List'
    NewProjectModal: require './react/layout/NewProjectModal'
    SystemJobsToggle: require('./modules/settings/SystemJobsToggle').default
