React = require 'react'
_ = require 'underscore'
Immutable = require 'immutable'
List = Immutable.List

TasksEditTable = React.createFactory(require './TasksEditTable')

TasksEditor = React.createClass
  displayName: 'TasksEditor'
  propTypes:
    tasks: React.PropTypes.object.isRequired
    components: React.PropTypes.object.isRequired
    isSaving: React.PropTypes.bool.isRequired
    onChange: React.PropTypes.func.isRequired
    updateLocalState: React.PropTypes.func.isRequired
    localState: React.PropTypes.object.isRequired

  render: ->
    TasksEditTable
      tasks: @props.tasks
      components: @props.components
      disabled: @props.isSaving
      onTaskDelete: @_handleTaskDelete
      onTaskUpdate: @_handleTaskUpdate
      updateLocalState: @props.updateLocalState
      localState: @props.localState
      handlePhaseMove: @_handlePhaseMove
      handlePhaseUpdate: @_handlePhaseUpdate
      handlePhasesSet: @_handlePhasesSet
      handleAddTask: @_handleTaskAdd

  _handleTaskDelete: (configurationId) ->
    @props.onChange(
      @props.tasks.map((phase) ->
        tasks = phase.get('tasks')
        tasks = tasks.filter((task) -> task.get('id') != configurationId)
        phase.set('tasks', tasks)
      )
    )

  _handlePhaseUpdate: (phaseId, newPhase) ->
    phaseIdx = @props.tasks.findIndex((phase) -> phase.get('id') == phaseId)
    newTasks = @props.tasks.set(phaseIdx, newPhase)
    @props.onChange(newTasks)

  _handlePhasesSet: (phases) ->
    @props.onChange(phases)

  _handleTaskUpdate: (updatedTask) ->
    taskId = updatedTask.get('id')
    newTasks = @props.tasks.map (phase) ->
      tasks = phase.get('tasks').map (task) ->
        if task.get('id') == taskId
          return updatedTask
        else
          return task
      phase.set('tasks', tasks)
    @props.onChange(newTasks)

  _handlePhaseMove: (id, afterId) ->
    phase = @props.tasks.find((phase) -> phase.get('id') == id)
    currentIndex = @props.tasks.findIndex((phase) -> phase.get('id') == id)
    afterIndex = @props.tasks.findIndex((phase) -> phase.get('id') == afterId)
    @props.onChange(
      @props.tasks.splice(currentIndex, 1).splice(afterIndex, 0, phase)
    )


  _handleTaskAdd: (component, configuration, phaseId) ->
    # prepare task
    task =
      id: _.uniqueId() # temporary id
      phase: phaseId
      component: component.get('id')
      action: "run"
      actionParameters:
        config: configuration.get('id')
      continueOnFailure: false
      active: true
      timeoutMinutes: null

    if component.get('id') == 'gooddata-writer'
      task.action = 'load-data'

    @props.onChange(
      @props.tasks.map (phase) ->
        if phase.get('id') == phaseId
          return phase.set('tasks', phase.get('tasks', List()).push(Immutable.fromJS(task)))
        else
          return phase
    )


module.exports = TasksEditor
