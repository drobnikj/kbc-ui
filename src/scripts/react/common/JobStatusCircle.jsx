import React from 'react';

import ApplicationStore from '../../stores/ApplicationStore';
import green from '@keboola/indigo-ui/src/kbc-bootstrap/img/status-green.svg';
import grey from '@keboola/indigo-ui/src/kbc-bootstrap/img/status-grey.svg';
import orange from '@keboola/indigo-ui/src/kbc-bootstrap/img/status-orange.svg';
import red from '@keboola/indigo-ui/src/kbc-bootstrap/img/status-red.svg';

const images = {
  green,
  grey,
  orange,
  red
};

const statusColorMap = {
  success: 'green',
  error: 'red',
  warn: 'red',
  warning: 'red',
  processing: 'orange',
  cancelled: 'grey',
  waiting: 'grey',
  terminating: 'grey',
  terminated: 'grey'
};

const getPathForColor = (color) => ApplicationStore.getScriptsBasePath() + images[color];

const JobStatusCircle = ({ status }) => {
  const color = statusColorMap[status] || 'grey';
  return (
    <img src={getPathForColor(color)} />
  );
};

JobStatusCircle.propTypes = {
  status: React.PropTypes.string
};

export default JobStatusCircle;
