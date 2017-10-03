import React from 'react';
import {Map} from 'immutable';

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
      const editingQuery = (ExDbStore.isEditingQuery(queryId)) ? ExDbStore.getEditingQuery(queryId) : query;
      return {
        configId: configId,
        queryId: queryId,
        editingQuery: editingQuery,
        editingQueries: ExDbStore.getEditingQueries(),
        isSaving: ExDbStore.isSavingQuery(queryId),
        isValid: ExDbStore.isEditingQueryValid(queryId),
        tables: StorageTablesStore.getAll(),
        sourceTables: ExDbStore.getSourceTables(),
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        componentSupportsSimpleSetup: ExDbActionCreators.componentSupportsSimpleSetup(),
        localState: ExDbStore.getLocalState()
      };
    },

    handleQueryChange(newQuery) {
      return ExDbActionCreators.changeQueryEdit(this.state.configId, newQuery);
    },

    handleReset() {
      return ExDbActionCreators.resetQueryEdit(this.state.configId, this.state.editingQuery.get('id'));
    },

    handleSave() {
      return ExDbActionCreators.saveQueryEdit(this.state.configId, this.state.editingQuery.get('id'));
    },

    getDefaultOutputTableId(name) {
      return ExDbActionCreators.getDefaultOutputTableId(this.state.configId, name);
    },

    getQueryElement() {
      return (
        <QueryEditor
          query={this.state.editingQuery || Map()}
          tables={this.state.tables}
          onChange={this.handleQueryChange}
          disabled={this.state.isSaving}
          showSimple={this.state.componentSupportsSimpleSetup}
          configId={this.state.configId}
          componentId={componentId}
          getDefaultOutputTable={this.getDefaultOutputTableId}
          isLoadingSourceTables={this.state.localState.getIn(loadingSourceTablesPath)}
          sourceTables={this.state.localState.getIn(sourceTablesPath)}
          sourceTablesError={this.state.localState.getIn(sourceTablesErrorPath)}
          destinationEditing={this.state.localState.getIn(['isDestinationEditing', this.state.queryId], false)}
          onDestinationEdit={ExDbActionCreators.destinationEdit}
          getPKColumns={ExDbActionCreators.getPKColumnsFromSourceTable}
        />
      );
    },

    render() {
      return (
        <div className="container-fluid kbc-main-content">
          <div className="col-md-3 kbc-main-nav">
            <div className="kbc-container">
              <QueryNav
                queries={this.state.queriesFiltered}
                navQuery={this.state.editingQuery || Map()}
                editingQueries={this.state.editingQueries}
                configurationId={this.state.configId}
                filter={this.state.queriesFilter}
                componentId={componentId}
                actionsProvisioning={actionsProvisioning}
              />
            </div>
          </div>
          <div className="col-md-9 kbc-main-content-with-nav">
            <div className="row kbc-header">
              <div className="kbc-buttons">
                <SaveButtons
                  isSaving={this.state.localState.getIn(['isSaving', this.state.queryId], false)}
                  isChanged={this.state.localState.getIn(['isChanged', this.state.queryId], false)}
                  onReset={this.handleReset}
                  onSave={this.handleSave}
                  disabled={this.state.localState.getIn(['isSaving', this.state.queryId], false) || !this.state.isValid}
                />
              </div>
            </div>
            <div className="col-md-9 kbc-main-content-with-nav">
              <div className="row kbc-header">
                <div className="kbc-buttons">
                  <SaveButtons
                    isSaving={this.state.localState.getIn(['isSaving', this.state.queryId], false)}
                    isChanged={this.state.localState.getIn(['isChanged', this.state.queryId], false)}
                    onReset={this.handleReset}
                    onSave={this.handleSave}
                  />
                </div>
              </div>
            </div>
            {this.getQueryElement()}
          </div>
        </div>
      );
    }
  });
}

