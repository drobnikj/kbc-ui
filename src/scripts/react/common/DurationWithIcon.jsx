import React from 'react';
import Duration from './Duration';

const DurationWithIcon = ({ startTime, endTime }) => (
  <span>
    <i className="fa fa-clock-o" />
    {' '}
    <Duration startTime={startTime} endTime={endTime} />
  </span>
);

DurationWithIcon.propTypes = {
  startTime: React.PropTypes.string,
  endTime: React.PropTypes.string
};

export default DurationWithIcon;
