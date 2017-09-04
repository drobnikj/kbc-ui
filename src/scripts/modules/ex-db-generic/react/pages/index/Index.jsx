import React from 'react';
import classnames from 'classnames';

import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

import * as storeProvisioning from '../../../storeProvisioning';
import RoutesStore from '../../../../../stores/RoutesStore';
import LatestJobsStore from '../../../../jobs/stores/LatestJobsStore';
import VersionsStore from '../../../../components/stores/VersionsStore';

import QueryTable from './QueryTable';
import ComponentDescription from '../../../../components/react/components/ComponentDescription';
import ComponentMetadata from '../../../../components/react/components/ComponentMetadata';
import SidebarVersions from '../../../../components/react/components/SidebarVersionsWrapper';

import DeleteConfigurationButton from '../../../../components/react/components/DeleteConfigurationButton';

import LatestJobs from '../../../../components/react/components/SidebarJobs';
import RunComponentButton from '../../../../components/react/components/RunComponentButton';

import {Link} from 'react-router';
import SearchRow from '../../../../../react/common/SearchRow';
import * as actionsProvisioning from '../../../actionsProvisioning';
import LastUpdateInfo from '../../../../../react/common/LastUpdateInfo';

export default function(componentId) {
  const actionsCreators = actionsProvisioning.createActions(componentId);
  return React.createClass({
    displayName: 'ExDbIndex',
    mixins: [createStoreMixin(VersionsStore, LatestJobsStore, storeProvisioning.componentsStore)],

    componentWillReceiveProps() {
      return this.setState(this.getStateFromStores());
    },

    componentDidMount() {
      return actionsProvisioning.loadSourceTables(componentId, this.state.configId);
    },

    getStateFromStores() {
      const config = RoutesStore.getRouterState().getIn(['params', 'config']);
      const ExDbStore = storeProvisioning.createStore(componentId, config);
      const queries = ExDbStore.getQueries();
      const credentials = ExDbStore.getCredentials();
      const enabledQueries = queries.filter(function(query) {
        return query.get('enabled');
      });
      return {
        configId: config,
        versions: VersionsStore.getVersions(componentId, config),
        pendingActions: ExDbStore.getQueriesPendingActions(),
        latestJobs: LatestJobsStore.getJobs(componentId, config),
        hasCredentials: ExDbStore.hasValidCredentials(credentials),
        queries: queries,
        queriesFilter: ExDbStore.getQueriesFilter(),
        queriesFiltered: ExDbStore.getQueriesFiltered(),
        hasEnabledQueries: enabledQueries.count() > 0
      };
    },

    handleFilterChange(query) {
      return actionsCreators.setQueriesFilter(this.state.configId, query);
    },

    renderNewQueryLink() {
      if (this.state.queries.count() >= 1) {
        const link = 'ex-db-generic-' + componentId + '-new-query';
        return (
          <Link
            to={link}
            params={{ config: this.state.configId }}
          >
            <button className="btn btn-success">
              <i className="kbc-icon-plus"/> New Query
            </button>
          </Link>
        );
      }
    },

    renderCredentialsSetup() {
      if (!this.state.hasCredentials) {
        const link = 'ex-db-generic-' + componentId + '-new-credentials';
        return (
          <div className="row component-empty-state text-center">
            <p>Please setup database credentials for this extractor</p>
            <Link
              to={link}
              params={{ config: this.state.configId }}
            >
              <button className="btn btn-success">Setup Database Credentials</button>
            </Link>
          </div>
        );
      }
    },

    renderSearchRow() {
      if (this.state.queries.count() > 1) {
        return (
          <SearchRow
            onChange={this.handleFilterChange}
            query={this.state.queriesFilter}
            className="row kbc-search-row"/>
        );
      }
    },

    renderQueriesMain() {
      if (this.state.queries.count() > 0) {
        if (this.state.queriesFiltered.count() > 0) {
          return (
            <QueryTable
              queries={this.state.queriesFiltered}
              configurationId={this.state.configId}
              componentId={componentId}
              pendingActions={this.state.pendingActions}/>
          );
        } else {
          return (
            <div className="table table-striped">
              <div className="tfoot">
                <div className="tr">
                  <div className="td">
                    No queries found
                  </div>
                </div>
              </div>
            </div>
          );
        }
      } else if (this.state.hasCredentials) {
        const link = 'ex-db-generic-' + componentId + '-new-query';
        return (
          <div className="row component-empty-state text-center">
            <p>There are no queries configured yet.</p>
            <Link to={link} params={{ config: this.state.configId }}>
              <button className="btn btn-success">
                <i className="kbc-icon-plus"/> New Query
              </button>
            </Link>
          </div>
        );
      }
    },

    renderCredentialsLink() {
      if (this.state.hasCredentials) {
        const link = 'ex-db-generic-' + componentId + '-credentials';
        return (
          <li>
            <Link to={link} params={{ config: this.state.configId }}>
              <i className="fa fa-fw fa-user"/> Database Credentials
            </Link>
          </li>
        );
      }
    },

    render() {
      const configurationId = this.state.configId;
      return (
        <div className="container-fluid">
          <div className="col-md-9 kbc-main-content">
            <div className="row kbc-header">
              <div className="col-sm-8">
                <ComponentDescription
                  componentId={componentId}
                  configId={this.state.configId}
                />
              </div>
              <div className="col-sm-4 kbc-buttons">
                {this.renderNewQueryLink()}
              </div>
            </div>
            {this.renderCredentialsSetup()}
            {this.renderSearchRow()}
            {this.renderQueriesMain()}
          </div>
          <div className="col-md-3 kbc-main-sidebar">
            <div className="kbc-buttons kbc-text-light">
              <ComponentMetadata
                componentId={componentId}
                configId={this.state.configId}
              />
              <LastUpdateInfo lastVersion={this.state.versions.get(0)}/>
            </div>
            <ul className="nav nav-stacked">
              {this.renderCredentialsLink()}
              <li className={classnames({ disabled: !this.state.hasEnabledQueries })}>
                <RunComponentButton
                  title="Run Extraction"
                  component={componentId}
                  mode="link"
                  disabled={!this.state.hasEnabledQueries}
                  disabledReason="There are no queries to be executed"
                  runParams={function() { return { config: configurationId }; }}
                >
                  You are about to run the extraction
                </RunComponentButton>
              </li>
              <li>
                <DeleteConfigurationButton
                  componentId={componentId}
                  configId={this.state.configId}
                />
              </li>
            </ul>

            <LatestJobs limit={3} jobs={this.state.latestJobs}/>

            <SidebarVersions limit={3} componentId={componentId}/>

          </div>
        </div>
      );
    }
  });
}
