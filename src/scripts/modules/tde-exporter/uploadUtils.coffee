_ = require 'underscore'
OrchestrationsStore = require '../orchestrations/stores/OrchestrationsStore'
OrchestrationsActions = require '../orchestrations/ActionCreators'
{fromJS} = require 'immutable'

storageInputFileTemplate = (fileId) ->
  storage =
      input:
        files: [
          query: "id:#{fileId}"
        ]
  return storage
componentGetRunJson =
  'wr-google-drive': (parameters, tdeFile, configId) ->
    account = parameters.get 'gdrive'
    result =
      external:
        account: account.toJS()
        query: "id:#{tdeFile.get('id')}"
        targetFolder: account.get('targetFolder')

  'wr-dropbox': (parameters, tdeFile, configId) ->
    storage = storageInputFileTemplate(tdeFile.get('id'))
    account = parameters.get 'dropbox'
    runParameters =
      credentials: account.get('id')
      mode: true
    result =
      #config: configId
      configData:
        storage: storage
        parameters: runParameters
    return result

  'wr-tableau-server': (parameters, tdeFile, configId) ->
    storage = storageInputFileTemplate(tdeFile.get('id'))
    credentials = parameters.get 'tableauServer'
    result =
      #config: configId
      configData:
        storage: storage
        parameters: credentials.toJS()
    return result

appendExportTask = (tasks, configId) ->
  found = tasks.find (task) ->
    isTde = task.get('component') == 'tde-exporter'
    hasConfig = task.getIn(['actionParameters', 'config']) == configId
    return isTde and hasConfig
  if not found
    task =
      component: 'tde-exporter'
      active: true
      action: 'run'
      actionParameters:
        config: configId
    tasks = tasks.push(fromJS(task))
  return tasks

getUploadTaskParameters = (uploadComponentId, account, configId) ->
  result = null
  storage =
    input:
      files: [
        'filter_by_run_id': true
        tags: ['tde']
      ]
  switch uploadComponentId
    when 'wr-tableau-server'
      result =
        configData:
          storage: storage
          parameters: account.toJS()
    when 'wr-dropbox'
      result =
        configData:
          storage: storage
          parameters:
            mode: true
            credentials: account.get('id')
    when 'wr-google-drive'
      gdrive = account.toJS()
      result =
        external:
          account:
            email: gdrive.email
            accessToken: gdrive.accessToken
            refreshToken: gdrive.refreshToken
          query: "+tags:tde +tags:table-export"
          filterByRunId: true
          targetFolder: gdrive.targetFolder
  return result




appendUploadTask = (tasks, uploadComponentId, account, configId) ->
  tdeIdx = tasks.findIndex (task) ->
    isTde = task.get('component') == 'tde-exporter'
    hasConfig = task.getIn(['actionParameters', 'config']) == configId
    return isTde and hasConfig

  if tdeIdx == null or tdeIdx == undefined
    throw Error('TDE task not found')

  taskParams = getUploadTaskParameters(uploadComponentId, account, configId)
  task =
    component: uploadComponentId
    action: 'run'
    active: true
    actionParameters: taskParams

  tasks = tasks.splice(tdeIdx + 1, 0, fromJS(task))
  return tasks


module.exports =

  isTableauServerAuthorized: (parameters) ->
    account = if parameters then parameters.get('tableauServer') else null
    account and
      not _.isEmpty(account.get('server_url')) and
      not _.isEmpty(account.get('username')) and
      not _.isEmpty(account.get('project_name')) and
      not (_.isEmpty(account.get('password')) and _.isEmpty(account.get('#password')))


  isDropboxAuthorized: (parameters) ->
    account = if parameters then parameters.get('dropbox') else null
    account and
      account.has('description') and
      account.has('id')

  isOauthV2Authorized: (parameters, componentId) ->
    account = parameters.get(componentId)
    !!account

  isGdriveAuthorized: (parameters) ->
    account = if parameters then parameters.get('gdrive') else null
    account and
      not _.isEmpty(account.get('accessToken')) and
      not _.isEmpty(account.get('refreshToken')) and
      not _.isEmpty(account.get('email'))

  prepareUploadRunParams: (componentId, parameters, tdeFile, configId) ->
    getParamsFn = componentGetRunJson[componentId]
    getParamsFn(parameters, tdeFile, configId)


  appendToOrchestration: (orchId, configId, uploadComponentId, account) ->
    orchId = parseInt orchId
    OrchestrationsActions.loadOrchestration(orchId).then ->
      tasks = OrchestrationsStore.getOrchestrationTasks(orchId)
      orch = OrchestrationsStore.get(orchId)
      orchName = orch.get('name')
      tasks = appendExportTask(tasks, configId)
      tasks = appendUploadTask(tasks, uploadComponentId, account, configId)
      OrchestrationsActions.startOrchestrationTasksEdit(orchId)
      OrchestrationsActions.updateOrchestrationsTasksEdit(orchId, tasks)
      OrchestrationsActions.saveOrchestrationTasks(orchId).then ->
        result =
          id: orchId
          name: orchName
        return result
