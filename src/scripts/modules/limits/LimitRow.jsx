import React, {PropTypes} from 'react';
import MetricGraph from './MetricGraph';
import AlarmIndicator from './AlarmIndicator';
import {Check} from 'kbc-react-components';
import classnames from 'classnames';
import {bytesToGBFormatted, numericMetricFormatted} from '../../utils/numbers';
import EditLimitButton from './EditLimitButton';

export default React.createClass({
  propTypes: {
    limit: PropTypes.object.isRequired,
    isKeenReady: PropTypes.bool.isRequired,
    canEdit: PropTypes.bool.isRequired,
    keenClient: PropTypes.object.isRequired
  },

  render() {
    const {limit} = this.props;
    return (
      <div className={classnames('tr', {'danger': limit.get('isAlarm')})}>
        <span className="td">
          <h3>
            {limit.get('name')} {limit.get('isAlarm') ? <AlarmIndicator isAlarm={true} /> : null}
          </h3>
        </span>
        <span className="td">
          {this.limit()}
          {this.props.canEdit ? <EditLimitButton limit={limit}/> : null}
        </span>
        <span className="td" style={{width: '50%'}}>
          {this.renderGraph()}
        </span>
      </div>
    );
  },

  limit() {
    const {limit}  = this.props;
    console.log('limit', limit.toJS());
    if (limit.get('unit') === 'bytes') {
      return `${bytesToGBFormatted(limit.get('metricValue'))} GB of ${bytesToGBFormatted(limit.get('limitValue'))} GB used`;
    } else if (limit.get('unit') === 'flag') {
      return (
        <Check isChecked={!!limit.get('metricValue')} />
      );
    } else if (!limit.get('limitValue')) {
      return numericMetricFormatted(limit.get('metricValue'));
    } else {
      return `${numericMetricFormatted(limit.get('metricValue'))} / ${numericMetricFormatted(limit.get('limitValue'))}`;
    }
  },

  renderGraph() {
    const graph = this.props.limit.get('graph');
    if (!graph) {
      return null;
    }
    if (!this.props.isKeenReady) {
      return (
        <span>Loading ... </span>
      );
    }
    return React.createElement(MetricGraph, {
      query: {
        eventCollection: graph.get('eventCollection'),
        targetProperty: graph.get('targetProperty'),
        timeframe: 'this_30_days',
        interval: 'daily'
      },
      isAlarm: this.props.limit.get('isAlarm'),
      limitValue: this.props.limit.get('limitValue'),
      unit: this.props.limit.get('unit'),
      client: this.props.keenClient
    });
  }

});