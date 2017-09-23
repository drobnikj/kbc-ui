import React from 'react';

import DurationWithIcon from './DurationWithIcon';

describe('<DurationWithIcon />', function() {
  it('should render with no props', function() {
    shallowSnapshot(
      <DurationWithIcon />
    );
  });

  it('should render with start prop', function() {
    shallowSnapshot(
      <DurationWithIcon
        startTime="2017-09-23T12:30:00+00:00"
      />
    );
  });

  it('should render with end props', function() {
    shallowSnapshot(
      <DurationWithIcon
        endTime="2017-09-23T14:30:00+00:00"
      />
    );
  });

  it('should render with both props', function() {
    shallowSnapshot(
      <DurationWithIcon
        startTime="2017-09-23T12:30:00+00:00"
        endTime="2017-09-23T14:30:00+00:00"
      />
    );
  });
});
