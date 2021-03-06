import React from 'react';
import Immutable, {List, Map} from 'immutable';
import _ from 'underscore';
import Promise from 'bluebird';
import moment from 'moment';
import filesize from 'filesize';
import later from 'later';

import storageActions from '../../components/StorageActionCreators';
import storageApi from '../../components/StorageApi';
import tablesStore from '../../components/stores/StorageTablesStore';

import TableLinkModalDialog from './components/ModalDialog';
import {startDataProfilerJob, getDataProfilerJob, fetchProfilerData} from './components/DataProfilerUtils';

import createStoreMixin from '../../../react/mixins/createStoreMixin';
import { factory as EventsServiceFactory} from '../../sapi-events/EventsService';

import RoutesStore from '../../../stores/RoutesStore';
import {PATH_PREFIX} from '../routes';

const  IMPORT_EXPORT_EVENTS = ['tableImportStarted', 'tableImportDone', 'tableImportError', 'tableExported'];

export default React.createClass({

  mixins: [createStoreMixin(tablesStore)],

  propTypes: {
    moreTables: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      moreTables: List()
    };
  },

  getStateFromStores() {
    return this.prepareStateFromProps({tableId: this.getTableId()});
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.prepareStateFromProps(nextProps));
  },

  prepareStateFromProps(props) {
    const isLoading = tablesStore.getIsLoading();
    const tables = tablesStore.getAll() || Map();
    const table = tables.get(props.tableId, Map());
    return {
      tableId: props.tableId,
      table: table,
      isLoading: isLoading
    };
  },

  changeTable(newTableId, dontLoadAll) {
    let newState = _.clone(this.prepareStateFromProps({tableId: newTableId}));
    const initDataState = {
      detailEventId: null,
      isCallingRunAnalysis: false,
      profilerData: Map(),
      loadingPreview: false,
      loadingProfilerData: false,
      dataPreview: Immutable.List(),
      dataPreviewError: null,
      events: Immutable.List()
    };
    newState = _.extend(newState, initDataState);
    this.setState(newState, () => {
      if (!dontLoadAll) {
        this.resetTableEvents();
        this.loadAll();
      }
    });
  },

  getRouteTableId() {
    return RoutesStore.getCurrentRouteParam('tableId');
  },

  getTableId() {
    return (this.state && this.state.tableId) ? this.state.tableId : this.getRouteTableId();
  },

  getInitialState() {
    const omitFetches = true, omitExports = false, filterIOEvents = false;
    const es = EventsServiceFactory({limit: 10});
    const eventQuery = this.prepareEventQuery({omitFetches, omitExports, filterIOEvents});
    es.setQuery(eventQuery);

    return ({
      eventService: es,
      events: Immutable.List(),
      dataPreview: Immutable.List(),
      dataPreviewError: null,
      loadingPreview: false,
      loadingProfilerData: false,
      omitFetches: omitFetches,
      omitExports: omitExports,
      filterIOEvents: filterIOEvents,
      isCallingRunAnalysis: false,
      detailEventId: null,
      profilerData: Map()
    });
  },

  componentDidMount() {
    setTimeout(() => storageActions.loadTables().then(this.onShow));
  },

  componentWilUnmount() {
    this.stopEventService();
    this.stopPollingDataProfilerJob();
  },

  pollDataProfilerJob() {
    const schedule = later.parse.recur().every(5).second();
    this.stopPollingDataProfilerJob();
    this.timeout = later.setInterval(this.getDataProfilerJobResult, schedule);
  },

  getDataProfilerJobResult() {
    const jobId = this.state.profilerData.getIn(['runningJob', 'id']);
    getDataProfilerJob(jobId).then( (runningJob) => {
      if (runningJob.isFinished) {
        this.stopPollingDataProfilerJob();
        this.findEnhancedJob();
      }
    });
  },

  stopPollingDataProfilerJob() {
    if (this.timeout) {
      this.timeout.clear();
    }
  },

  findEnhancedJob() {
    // do the enhanced analysis only for redshift tables
    if (!this.isRedshift()) {
      return;
    }
    this.setState({loadingProfilerData: true});
    const tableId = this.getTableId();
    const component = this;
    fetchProfilerData(tableId).then( (result) =>{
      component.setState({
        profilerData: Immutable.fromJS(result),
        loadingProfilerData: false
      });
      if (result && result.runningJob) {
        this.pollDataProfilerJob();
      }
    });
  },

  render() {
    return (
      <span key="mainspan">
        {this.renderModal()}
      </span>
    );
  },

/*   renderLink() {
    return (
      <Tooltip key="tooltip"
        tooltip={this.renderTooltip()}
        placement="top">
        <span key="buttonlink" className="kbc-sapi-table-link"
          onClick={this.onShow}>
          {this.props.children || this.props.linkLabel || this.props.tableId}
        </span>
      </Tooltip>
    );
  }, */

  renderTooltip() {
    if (this.state.isLoading) {
      return 'Loading';
    }

    const table = this.state.table;
    if (!this.tableExists()) {
      return 'Table does not exist.';
    }
    if (table.get('lastChangeDate') === null) {
      return 'Table exists, but was never imported.';
    }
    return (
      <span key="tooltipinfo">
        <div>
          {moment(table.get('lastChangeDate')).fromNow()}
        </div>
        <div>
          {filesize(table.get('dataSizeBytes', 'N/A'))}
        </div>
        <div>
          {table.get('rowsCount', 'N/A')} rows
        </div>
      </span>
    );
  },

  renderModal() {
    return (
      <TableLinkModalDialog
        moreTables={this.props.moreTables.toArray()}
        tableId={this.getTableId()}
        reload={this.reload}
        tableExists={this.tableExists()}
        omitFetches={this.state.omitFetches}
        omitExports={this.state.omitExports}
        onHideFn={this.onHide}
        isLoading={this.isLoading()}
        table={this.state.table}
        dataPreview={this.state.dataPreview}
        dataPreviewError={this.state.dataPreviewError}
        onOmitExportsFn={this.onOmitExports}
        onOmitFetchesFn={this.onOmitFetches}
        events={this.state.events}
        enhancedAnalysis={this.state.profilerData}
        onRunAnalysis={this.onRunEnhancedAnalysis}
        isCallingRunAnalysis={this.state.isCallingRunAnalysis}
        loadingProfilerData={this.state.loadingProfilerData}
        isRedshift={this.isRedshift()}
        onChangeTable={this.changeTable}
        filterIOEvents={this.state.filterIOEvents}
        onFilterIOEvents={this.onFilterIOEvents}
        onShowEventDetail={(eventId) => this.setState({detailEventId: eventId})}
        detailEventId={this.state.detailEventId}
      />
    );
  },

  onRunEnhancedAnalysis() {
    this.setState({isCallingRunAnalysis: true});
    startDataProfilerJob(this.getTableId())
      .then( () => {
        this.findEnhancedJob().then(() => this.setState({isCallingRunAnalysis: false}));
      })
      .catch(() => this.setState({isCallingRunAnalysis: false}));
  },

  onOmitExports(e) {
    const checked = e.target.checked;
    this.setState({omitExports: checked}, () => {
      const q = this.prepareEventQuery();
      this.state.eventService.setQuery(q);
      this.state.eventService.load();
    });
  },

  onOmitFetches(e) {
    const checked = e.target.checked;
    this.setState({omitFetches: checked}, () => {
      const q = this.prepareEventQuery();
      this.state.eventService.setQuery(q);
      this.state.eventService.load();
    });
  },

  onFilterIOEvents(e) {
    const checked = e.target.checked;
    this.setState({filterIOEvents: checked}, () => {
      const q = this.prepareEventQuery();
      this.state.eventService.setQuery(q);
      this.state.eventService.load();
    });
  },

  resetTableEvents() {
    const q = this.prepareEventQuery();
    this.stopEventService();
    this.state.eventService.reset();
    this.state.eventService.setQuery(q);
  },

  prepareEventQuery(initState) {
    const state = initState || this.state;
    const {omitExports, omitFetches, filterIOEvents} = state;
    const omitFetchesEvent = omitFetches ? ['tableDataPreview', 'tableDetail'] : [];
    const omitExportsEvent = omitExports ? ['tableExported'] : [];
    let omitsQuery = omitFetchesEvent.concat(omitExportsEvent).map((ev) => `NOT event:storage.${ev}`);
    if (filterIOEvents) {
      omitsQuery =  IMPORT_EXPORT_EVENTS.map((ev) => `event:storage.${ev}`);
    }
    const objectIdQuery = `objectId:${this.getTableId()}`;
    return _.isEmpty(omitsQuery) ? objectIdQuery : `((${omitsQuery.join(' OR ')}) AND ${objectIdQuery})`;
  },

  isLoading() {
    return this.state.isLoading || this.state.loadingPreview || this.state.eventService.getIsLoading();
  },

  redirectBack() {
    const routerState = RoutesStore.getRouterState();
    const currentPath = routerState.get('path') || '';
    const parts = currentPath.split(`/${PATH_PREFIX}/`);
    const backPath = parts ? parts[0] : '/';
    RoutesStore.getRouter().transitionTo(backPath || '/');
  },

  onHide() {
    this.setState({show: false});
    this.changeTable(this.getRouteTableId(), true);
    this.stopPollingDataProfilerJob();
    this.stopEventService();
    this.redirectBack();
  },

  reload() {
    Promise.props( {
      'loadAllTablesFore': storageActions.loadTablesForce().then(() => this.findEnhancedJob()),
      'exportData': this.exportDataSample(),
      'loadEvents': this.state.eventService.load()
    });
  },

  loadAll() {
    this.exportDataSample();
    this.startEventService();
    this.setState({show: true});
    this.findEnhancedJob();
  },

  onShow() {
    if (this.state.isLoading) {
      storageApi.getTables().then(() => this.loadAll());
    } else {
      this.loadAll();
    }
  },

  startEventService() {
    this.state.eventService.addChangeListener(this.handleEventsChange);
    this.state.eventService.load();
  },

  stopEventService() {
    this.state.eventService.stopAutoReload();
    this.state.eventService.removeChangeListener(this.handleEventsChange);
  },

  handleEventsChange() {
    const events = this.state.eventService.getEvents();
    this.setState({events: events});
  },

  exportDataSample() {
    if (!this.tableExists()) {
      return false;
    }

    this.setState({
      loadingPreview: true
    });
    const component = this;
    return storageApi
      .tableDataPreview(this.getTableId(), {limit: 10})
      .then( (csv) => {
        component.setState({
          loadingPreview: false,
          dataPreview: Immutable.fromJS(csv)
        });
      })
      .catch((error) => {
        let dataPreviewError = null;
        if (error.response && error.response.body) {
          if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
            dataPreviewError = 'Data sample cannot be displayed. Too many columns.';
          } else {
            dataPreviewError = error.response.body.message;
          }
        } else {
          throw new Error(JSON.stringify(error));
        }
        component.setState({
          loadingPreview: false,
          dataPreviewError: dataPreviewError
        });
      });
  },

  tableExists() {
    return !_.isEmpty(this.state.table.toJS());
  },

  isRedshift() {
    return this.tableExists() && this.state.table.getIn(['bucket', 'backend']) === 'redshift';
  }

});
