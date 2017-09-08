import StoreUtils from '../../../utils/StoreUtils';
import Immutable from 'immutable';
import dispatcher from '../../../Dispatcher';
import MetadataConstants from '../MetadataConstants';
import Constants from '../Constants';

import _ from 'underscore';

var Map = Immutable.Map, List = Immutable.List;

var _store = Map({
  savingMetadata: Map(),
  editingMetadata: Map(),
  metadata: Map(),

  filters: Map()
});

var MetadataStore = StoreUtils.createStore({

  // returns Map of Lists of table ids grouped by metadata value defined by metadata key
  // example {ex-google-drive: ["in.c-ex-gdrive.mydata"]}
  groupTablesByMetadataValue(key) {
    const allTablesMetadata = _store.getIn(['metadata', 'table'], Map());
    const grouped = allTablesMetadata.groupBy((tableMetadata) => {
      const mtItem = tableMetadata.find(m => m.get('key') === key);
      return mtItem ? mtItem.get('value') : 'N/A';
    });
    return grouped.map((tgroups) =>
      tgroups.map((mt, tableId) => tableId).toList()
    );
  },

  getColumnMetadata: function(tableId, column, provider, metadataKey) {
    var columnId = tableId + '.' + column;
    return this.getMetadata('column', columnId, provider, metadataKey);
  },

  getAllColumnMetadata: function(tableId, column) {
    return this.getMetadataAll('column', tableId + '.' + column);
  },

  getAllTableMetadata: function(tableId) {
    return this.getMetadataAll('table', tableId);
  },

  getTableMetadata: function(tableId, provider, metadataKey) {
    return this.getMetadata('table', tableId, provider, metadataKey);
  },

  getTableMetadataValue: function(tableId, provider, metadataKey) {
    return this.getTableMetadata(tableId, provider, metadataKey).get('value');
  },

  getMetadata: function(objectType, objectId, provider, metadataKey) {
    if (this.hasMetadata(objectType, objectId)) {
      var metadataList = this.getMetadataAll(objectType, objectId);
      return metadataList.find(
        metadata =>  (metadata.get('provider') === provider && metadata.get('key') === metadataKey)
      );
    }
    return false;
  },

  hasMetadata: function(objectType, objectId) {
    return _store.hasIn(['metadata', objectType, objectId]);
  },

  hasMetadataKey: function(objectType, objectId, metadataKey) {
    return _store.getIn(['metadata', objectType, objectId]).hasIn(['key', metadataKey]);
  },


  getMetadataAll: function(objectType, objectId) {
    return _store.getIn(['metadata', objectType, objectId], List);
  },

  hasProviderMetadata: function(objectType, objectId, provider, metadataKey) {
    var objectMetadata = this.getMetadata(objectType, objectId);
    var foundMetadata = objectMetadata.find(
      metadata =>  metadata.get('provider') === provider && metadata.get('key') === metadataKey
    );
    return !(typeof foundMetadata === 'undefined' || foundMetadata === null);
  },

  getMetadataValue: function(objectType, objectId, provider, metadataKey) {
    var metadata = this.getMetadata(objectType, objectId, provider, metadataKey);
    if (metadata) {
      return metadata.get('value');
    }
    return '';
  },

  getEditingMetadataValue: function(objectType, objectId, metadataKey) {
    return _store.getIn(['editingMetadata', objectType, objectId, metadataKey]);
  },

  isEditingMetadata: function(objectType, objectId, metadataKey) {
    return _store.hasIn(['editingMetadata', objectType, objectId, metadataKey]);
  },

  isSavingMetadata: function(objectType, objectId, metadataKey) {
    return _store.hasIn(['savingMetadata', objectType, objectId, metadataKey]);
  }

});

dispatcher.register(function(payload) {
  var action;
  action = payload.action;

  switch (action.type) {

    case MetadataConstants.ActionTypes.METADATA_EDIT_START:
      _store = _store.setIn(
        ['editingMetadata', action.objectType, action.objectId, action.metadataKey],
        MetadataStore.getMetadataValue(action.objectType, action.objectId, 'user', action.metadataKey)
      );
      return MetadataStore.emitChange();

    case MetadataConstants.ActionTypes.METADATA_EDIT_UPDATE:
      _store = _store.setIn(
        ['editingMetadata', action.objectType, action.objectId, action.metadataKey],
        action.value
      );
      return MetadataStore.emitChange();
    case MetadataConstants.ActionTypes.METADATA_EDIT_STOP:
      _store = _store.deleteIn(['editingMetadata', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();

    case MetadataConstants.ActionTypes.METADATA_EDIT_CANCEL:
      _store = _store.deleteIn(['editingMetadata', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();

    case MetadataConstants.ActionTypes.METADATA_SAVE_START:
      _store = _store.setIn(['savingMetadata', action.objectType, action.objectId, action.metadataKey], action.value);
      return MetadataStore.emitChange();

    case MetadataConstants.ActionTypes.METADATA_SAVE_ERROR:
      return MetadataStore.emitChange();

    case MetadataConstants.ActionTypes.METADATA_SAVE_SUCCESS:
      _store = _store.setIn(['metadata', action.objectType, action.objectId], Immutable.fromJS(action.metadata));
      _store = _store.deleteIn(['savingMetadata', action.objectType, action.objectId, action.metadataKey]);
      return MetadataStore.emitChange();

    case Constants.ActionTypes.STORAGE_TABLES_LOAD_SUCCESS:
      _.each(action.tables, function(table) {
        const tableMetadata = Immutable.fromJS(table.metadata);
        _store = _store.setIn(
          ['metadata', 'table', table.id], tableMetadata
        );
        _.each(table.columnMetadata, function(metadata, columnName) {
          _store = _store.setIn(
            ['metadata', 'column', table.id + '.' + columnName], Immutable.fromJS(metadata)
          );
        });
      });
      return MetadataStore.emitChange();
    default:

  }
});

module.exports = MetadataStore;
