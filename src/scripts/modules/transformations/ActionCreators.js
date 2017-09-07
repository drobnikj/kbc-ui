import dispatcher from '../../Dispatcher';
import constants from './Constants';
import React from 'react';
import {Link} from 'react-router';
import ConfigurationCopiedNotification from '../components/react/components/ConfigurationCopiedNotification';
import transformationsApi from './TransformationsApiAdapter';
import installedComponentsApi from '../components/InstalledComponentsApi';
import TransformationBucketsStore from './stores/TransformationBucketsStore';
import TransformationsStore from './stores/TransformationsStore';
import InstalledComponentsActionCreators from '../components/InstalledComponentsActionCreators';
import RoutesStore from '../../stores/RoutesStore';
import Promise from 'bluebird';
import _ from 'underscore';
import parseQueries from './utils/parseQueries';
import VersionActionCreators from '../components/VersionsActionCreators';
import ApplicationActionCreators from '../../actions/ApplicationActionCreators';
import StringUtils from '../../utils/string';
import {debounce} from 'lodash';
import {List} from 'immutable';

const updateTransformationEditingFieldQueriesStringDebouncer = debounce(function(bucketId, transformationId, queriesString) {
  dispatcher.handleViewAction({
    type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES,
    bucketId: bucketId,
    transformationId: transformationId,
    queriesString: queriesString
  });
  return parseQueries(queriesString).then(function(splitQueries) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_SUCCESS,
      bucketId: bucketId,
      transformationId: transformationId,
      splitQueries: splitQueries
    });
  }).catch(function() {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_PARSE_QUERIES_ERROR,
      bucketId: bucketId,
      transformationId: transformationId
    });
  });
}, 1000);

module.exports = {
  createTransformationBucket: function(data) {
    var changeDescription, newBucket;
    newBucket = {};
    changeDescription = 'Create transformation bucket ' + data.name;
    return transformationsApi.createTransformationBucket(data, changeDescription).then(function(bucket) {
      newBucket = bucket;
      return InstalledComponentsActionCreators.loadComponentsForce();
    }).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_CREATE_SUCCESS,
        bucket: newBucket
      });
      VersionActionCreators.loadVersionsForce('transformation', newBucket.id);
      return RoutesStore.getRouter().transitionTo('transformationBucket', {
        config: newBucket.id
      });
    });
  },
  createTransformation: function(bucketId, data) {
    var changeDescription;
    changeDescription = 'Create transformation ' + data.get('name');
    return transformationsApi.createTransformation(bucketId, data.toJS(), changeDescription).then(function(transformation) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_CREATE_SUCCESS,
        bucketId: bucketId,
        transformation: transformation
      });
      VersionActionCreators.loadVersionsForce('transformation', bucketId);
      return RoutesStore.getRouter().transitionTo('transformationDetail', {
        row: transformation.id,
        config: bucketId
      });
    });
  },
  deleteTransformationBucket: function(bucketId) {
    var actions, bucket;
    actions = this;
    bucket = TransformationBucketsStore.get(bucketId);
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE,
      bucketId: bucketId
    });
    dispatcher.handleViewAction({
      type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_START,
      componentId: 'transformation',
      configurationId: bucketId,
      transition: false
    });
    return installedComponentsApi.deleteConfiguration('transformation', bucketId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_SUCCESS,
        bucketId: bucketId
      });
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_SUCCESS,
        componentId: 'transformation',
        configurationId: bucketId,
        transition: false
      });
      InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
      return ApplicationActionCreators.sendNotification({
        message: React.createClass({
          propTypes: {
            onClick: React.PropTypes.func.isRequired
          },
          revertConfigRemove: function() {
            actions.restoreTransformationBucket(bucket);
            return this.props.onClick();
          },
          render: function() {
            return React.DOM.span(null, 'Bucket ' + (bucket.get('name')) + ' was moved to ', React.createElement(Link, {
              to: 'settings-trash',
              onClick: this.props.onClick
            }, 'Trash'), '. ', React.DOM.a({
              onClick: this.revertConfigRemove
            }, 'Revert'));
          }
        })
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_BUCKET_DELETE_ERROR,
        bucketId: bucketId
      });
      dispatcher.handleViewAction({
        type: constants.ActionTypes.INSTALLED_COMPONENTS_DELETE_CONFIGURATION_ERROR,
        componentId: 'transformation',
        configurationId: bucketId,
        transition: false,
        error: e
      });
      throw e;
    });
  },
  restoreTransformationBucket: function(bucket) {
    const bucketId = bucket.get('id');
    dispatcher.handleViewAction({
      type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE,
      bucketId: bucketId
    });
    return transformationsApi.restoreTransformationBucket(bucketId).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_SUCCESS,
        bucketId: bucketId
      });
      return InstalledComponentsActionCreators.loadComponentConfigsData('transformation').then(function() {
        return ApplicationActionCreators.sendNotification({
          message: React.createClass({
            propTypes: {
              onClick: React.PropTypes.func.isRequired
            },
            render: function() {
              return React.createElement(ConfigurationCopiedNotification, {
                message: 'Bucket ' + (bucket.get('name')) + ' was ',
                linkLabel: 'restored',
                componentId: 'transformation',
                configId: bucketId,
                onClick: this.props.onClick
              });
            }
          })
        });
      });
    }).catch(function(e) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.DELETED_TRANSFORMATION_BUCKET_RESTORE_ERROR,
        bucketId: bucketId
      });
      throw e;
    });
  },
  deleteTransformation: function(bucketId, transformationId) {
    var changeDescription, transformation;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_DELETE,
      bucketId: bucketId,
      transformationId: transformationId
    });
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    changeDescription = 'Delete transformation ' + transformation.get('name');
    return transformationsApi.deleteTransformation(bucketId, transformationId, changeDescription).then(function() {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_DELETE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId
      });
      VersionActionCreators.loadVersionsForce('transformation', bucketId);
      InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_DELETE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId
      });
      throw error;
    });
  },

  /*
    Request overview load from server
   */
  loadTransformationOverview: function(bucketId, transformationId, showDisabled) {
    return _.defer(function() {
      var tableId;
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD,
        transformationId: transformationId,
        bucketId: bucketId
      });
      tableId = bucketId + '.' + transformationId;
      return transformationsApi.getGraph({
        tableId: tableId,
        direction: 'around',
        showDisabled: showDisabled,
        limit: {
          sys: [bucketId]
        }
      }).then(function(graphData) {
        return dispatcher.handleViewAction({
          type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_SUCCESS,
          transformationId: transformationId,
          bucketId: bucketId,
          model: graphData
        });
      }).catch(function(error) {
        dispatcher.handleViewAction({
          type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_LOAD_ERROR,
          transformationId: transformationId,
          bucketId: bucketId
        });
        throw error;
      });
    });
  },
  showTransformationOverviewDisabled: function(bucketId, transformationId, showDisabled) {
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_OVERVIEW_SHOW_DISABLED,
      transformationId: transformationId,
      bucketId: bucketId,
      showDisabled: showDisabled
    });
    return this.loadTransformationOverview(bucketId, transformationId, showDisabled);
  },
  toggleOpenInputMapping: function(bucketId, transformationId, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_INPUT_MAPPING_OPEN_TOGGLE,
      transformationId: transformationId,
      bucketId: bucketId,
      index: index
    });
  },
  toggleOpenOutputMapping: function(bucketId, transformationId, index) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_OUTPUT_MAPPING_OPEN_TOGGLE,
      transformationId: transformationId,
      bucketId: bucketId,
      index: index
    });
  },
  changeTransformationProperty: function(bucketId, transformationId, propertyName, newValue, changeDescription) {
    var pendingAction, transformation, finalChangeDescription;
    finalChangeDescription = changeDescription;
    pendingAction = 'save-' + propertyName;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.set(propertyName, newValue);
    if (!changeDescription) {
      finalChangeDescription = 'Change ' + StringUtils.capitalize(propertyName) + ' in ' + transformation.get('name');
    }
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), finalChangeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: propertyName,
        pendingAction: pendingAction,
        data: response
      });
      return VersionActionCreators.loadVersionsForce('transformation', bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: propertyName,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },
  setTransformationBucketsFilter: function(query) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_FILTER_CHANGE,
      filter: query
    });
  },
  toggleBucket: function(bucketId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_BUCKETS_TOGGLE,
      bucketId: bucketId
    });
  },
  startTransformationFieldEdit: function(bucketId, transformationId, fieldId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_START_EDIT_FIELD,
      bucketId: bucketId,
      transformationId: transformationId,
      fieldId: fieldId
    });
  },
  updateTransformationEditingField: function(bucketId, transformationId, fieldId, newValue) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_UPDATE_EDITING_FIELD,
      bucketId: bucketId,
      transformationId: transformationId,
      fieldId: fieldId,
      newValue: newValue
    });
  },
  updateTransformationEditingFieldQueriesString: function(bucketId, transformationId, queriesString) {
    return updateTransformationEditingFieldQueriesStringDebouncer(bucketId, transformationId, queriesString);
  },
  cancelTransformationEditingField: function(bucketId, transformationId, fieldId) {
    return dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_CANCEL_EDITING_FIELD,
      bucketId: bucketId,
      transformationId: transformationId,
      fieldId: fieldId
    });
  },

  saveTransformationQueries: function(bucketId, transformationId) {
    var transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    const pendingAction = 'save-queries';
    const changeDescription = 'Change Queries in ' + transformation.get('name');
    const transformationEditingFields = TransformationsStore.getTransformationEditingFields(bucketId, transformationId);
    transformation = transformation.set('queries', transformationEditingFields.get('splitQueries'));
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        data: response
      });
      return VersionActionCreators.loadVersionsForce('transformation', bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },

  saveTransformationScript: function(bucketId, transformationId) {
    var transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    const pendingAction = 'save-queries';
    const changeDescription = 'Change Script in ' + transformation.get('name');
    const transformationEditingFields = TransformationsStore.getTransformationEditingFields(bucketId, transformationId);
    transformation = transformation.set('queries', List([transformationEditingFields.get('queriesString')]));
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        data: response
      });
      return VersionActionCreators.loadVersionsForce('transformation', bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: 'queries',
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },

  saveTransformationEditingField: function(bucketId, transformationId, fieldId, changeDescription) {
    var pendingAction, transformation, value, finalChangeDescription;
    finalChangeDescription = changeDescription;
    value = TransformationsStore.getTransformationEditingFields(bucketId, transformationId).get(fieldId);
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.set(fieldId, value);
    if (!finalChangeDescription) {
      finalChangeDescription = 'Change ' + StringUtils.capitalize(fieldId) + ' in ' + transformation.get('name');
    }
    pendingAction = 'save-' + fieldId;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), finalChangeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: fieldId,
        pendingAction: pendingAction,
        data: response
      });
      return VersionActionCreators.loadVersionsForce('transformation', bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: fieldId,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  },

  /*
    Create new or update existing output mapping
   */
  saveTransformationMapping: function(bucketId, transformationId, mappingType, editingId, mappingIndex = null) {
    var changeDescription, mapping, transformation;
    mapping = TransformationsStore.getTransformationEditingFields(bucketId, transformationId).get(editingId);
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    if (mappingIndex === null) {
      changeDescription = 'Create ' + mappingType + ' mapping in ' + transformation.get('name');
    } else {
      changeDescription = 'Update ' + mappingType + ' mapping in ' + transformation.get('name');
    }
    transformation = transformation.update(mappingType, function(mappings) {
      if (mappingIndex !== null) {
        return mappings.set(mappingIndex, mapping);
      } else {
        return mappings.push(mapping);
      }
    });
    if (!mapping) {
      return Promise.resolve();
    }
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        editingId: editingId,
        data: response
      });
      return VersionActionCreators.loadVersionsForce('transformation', bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        error: error
      });
      throw error;
    });
  },
  deleteTransformationMapping: function(bucketId, transformationId, mappingType, mappingIndex) {
    var changeDescription, pendingAction, transformation;
    transformation = TransformationsStore.getTransformation(bucketId, transformationId);
    transformation = transformation.update(mappingType, function(mappings) {
      return mappings.delete(mappingIndex);
    });
    changeDescription = 'Delete ' + mappingType + ' mapping in ' + transformation.get('name');
    pendingAction = 'delete-' + mappingType + '-' + mappingIndex;
    dispatcher.handleViewAction({
      type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_START,
      transformationId: transformationId,
      bucketId: bucketId,
      pendingAction: pendingAction
    });
    return transformationsApi.saveTransformation(bucketId, transformationId, transformation.toJS(), changeDescription).then(function(response) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_SUCCESS,
        transformationId: transformationId,
        bucketId: bucketId,
        data: response,
        pendingAction: pendingAction
      });
      return VersionActionCreators.loadVersionsForce('transformation', bucketId);
    }).catch(function(error) {
      dispatcher.handleViewAction({
        type: constants.ActionTypes.TRANSFORMATION_EDIT_SAVE_ERROR,
        transformationId: transformationId,
        bucketId: bucketId,
        pendingAction: pendingAction,
        error: error
      });
      throw error;
    });
  }
};

// ---
// generated by coffee-script 1.9.2
