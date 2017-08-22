import React from 'react';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';

import QueryEditor from '../../components/QueryEditor';
import QueryDetailStatic from './QueryDetailStatic';
import QueryNav from './QueryNav';
import EditButtons from '../../../../../react/common/EditButtons';

export default function(componentId, actionsProvisioning, storeProvisioning) {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'ExDbQueryDetail',
    mixins: [createStoreMixin(storeProvisioning.componentsStore, StorageTablesStore)],

    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const queryId = RoutesStore.getCurrentRouteIntParam('query');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      const isEditing = ExDbStore.isEditingQuery(queryId);
      const query = ExDbStore.getConfigQuery(queryId);
      const editingQuery = ExDbStore.getEditingQuery(queryId);

      return {
        configId: configId,
        query: query,
        editingQuery: editingQuery,
        isEditing: isEditing,
        isSaving: ExDbStore.isSavingQuery(),
        isValid: ExDbStore.isEditingQueryValid(queryId),
        tables: StorageTablesStore.getAll(),
        sourceTables: ExDbStore.getSourceTables(),
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        defaultOutputTable: ExDbStore.getDefaultOutputTableId(editingQuery),
        componentSupportsSimpleSetup: ExDbActionCreators.componentSupportsSimpleSetup(),
        localState: ExDbStore.getLocalState()
      };
    },

    handleQueryChange(newQuery) {
      return ExDbActionCreators.updateEditingQuery(this.state.configId, newQuery);
    },

    handleEditStart() {
      return ExDbActionCreators.editQuery(this.state.configId, this.state.query.get('id'));
    },

    handleCancel() {
      return ExDbActionCreators.cancelQueryEdit(this.state.configId, this.state.query.get('id'));
    },

    handleSave() {
      return ExDbActionCreators.saveQueryEdit(this.state.configId, this.state.query.get('id'));
    },

    getQueryElement() {
      if (this.state.isEditing) {
        return (
          <QueryEditor
            query={this.state.editingQuery}
            tables={this.state.tables}
            onChange={this.handleQueryChange}
            showSimple={this.state.componentSupportsSimpleSetup}
            sourceTables={this.state.sourceTables}
            configId={this.state.configId}
            componentId={componentId}
            defaultOutputTable={this.state.defaultOutputTable}
            {... ExDbActionCreators.prepareLocalState(this.state.configId)}
          />
        );
      } else {
        return (
          <QueryDetailStatic
            query={this.state.query}
            componentId={componentId}/>
        );
      }
    },

    render() {
      return (
        <div className="container-fluid">
          <div className="kbc-main-content">
            <div className="col-md-3 kbc-main-nav">
              <div className="kbc-container">
                <QueryNav
                  queries={this.state.queriesFiltered}
                  configurationId={this.state.configId}
                  filter={this.state.queriesFilter}
                  componentId={componentId}
                  actionsProvisioning={actionsProvisioning}/>
              </div>
            </div>
            <div className="col-md-9 kbc-main-content-with-nav">
              <div className="row kbc-header">
                <div className="kbc-buttons">
                  <EditButtons
                    isEditing={this.state.isEditing}
                    isSaving={this.state.isSaving}
                    isDisabled={!this.state.isValid}
                    onCancel={this.handleCancel}
                    onSave={this.handleSave}
                    onEditStart={this.handleEditStart}/>
                </div>
              </div>
              {this.getQueryElement()}
            </div>
          </div>
        </div>
      );
    }
  });
}

