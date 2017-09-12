import React from 'react';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

import StorageTablesStore from '../../../../components/stores/StorageTablesStore';
import RoutesStore from '../../../../../stores/RoutesStore';

import QueryEditor from '../../components/QueryEditor';
import {loadingSourceTablesPath} from '../../../storeProvisioning';
import {sourceTablesPath} from '../../../storeProvisioning';
import {sourceTablesErrorPath} from '../../../storeProvisioning';

import QueryNav from './QueryNav';
import SaveButtons from '../../../../../react/common/SaveButtons';
import {loadSourceTables} from '../../../actionsProvisioning';

export default function(componentId, actionsProvisioning, storeProvisioning) {
  const ExDbActionCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'ExDbQueryDetail',
    mixins: [createStoreMixin(storeProvisioning.componentsStore, StorageTablesStore)],

    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },

    componentDidMount() {
      // fetch sourceTable info if not done already
      if (!this.state.sourceTables) {
        return loadSourceTables(componentId, this.state.configId);
      }
    },

    getStateFromStores() {
      const configId = RoutesStore.getCurrentRouteParam('config');
      const queryId = RoutesStore.getCurrentRouteIntParam('query');
      const ExDbStore = storeProvisioning.createStore(componentId, configId);
      const query = ExDbStore.getConfigQuery(queryId);

      return {
        configId: configId,
        editingQuery: (ExDbStore.isEditingQuery(queryId)) ? ExDbStore.getEditingQuery(queryId) : query,
        isSaving: ExDbStore.isSavingQuery(),
        isValid: ExDbStore.isEditingQueryValid(queryId),
        tables: StorageTablesStore.getAll(),
        sourceTables: ExDbStore.getSourceTables(),
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        defaultOutputTable: ExDbStore.getDefaultOutputTableId(query),
        componentSupportsSimpleSetup: ExDbActionCreators.componentSupportsSimpleSetup(),
        localState: ExDbStore.getLocalState()
      };
    },

    handleQueryChange(newQuery) {
      return ExDbActionCreators.editChange(this.state.configId, newQuery);
    },

    handleReset() {
      return ExDbActionCreators.cancelQueryEdit(this.state.configId, this.state.editingQuery.get('id'));
    },

    handleSave() {
      return ExDbActionCreators.saveQueryEdit(this.state.configId, this.state.editingQuery.get('id'));
    },

    getQueryElement() {
      return (
        <QueryEditor
          query={this.state.editingQuery}
          tables={this.state.tables}
          onChange={this.handleQueryChange}
          showSimple={this.state.componentSupportsSimpleSetup}
          configId={this.state.configId}
          componentId={componentId}
          defaultOutputTable={this.state.defaultOutputTable}
          isLoadingSourceTables={this.state.localState.getIn(loadingSourceTablesPath)}
          sourceTables={this.state.localState.getIn(sourceTablesPath)}
          sourceTablesError={this.state.localState.getIn(sourceTablesErrorPath)}
        />
      );
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

