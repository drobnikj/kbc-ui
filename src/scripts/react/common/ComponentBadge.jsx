import React, {PropTypes} from 'react';


export default React.createClass({
  propTypes: {
    flag: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['title', 'inline']),
    component: PropTypes.object.isRequired
  },

  render() {
    const badges = this.getBadges();

    return (
      <div>
        {badges.map((badge) =>
          <div>
            <div className={'badge-component-wrap-' + this.props.type}>
              <div className={'badge badge-component-item badge-component-item-' + badge.key}
                title={this.props.type === 'title' ? badge.description : ''}
                key={badge.key}
              >
              {badge.title}
              </div>
            </div>
            {this.props.type === 'inline' &&
            <div className="badge-component-description">
              {badge.description}
            </div>
            }
          </div>
        )}
      </div>
    );
  },

  getBadges() {
    const flags = this.props.component.get('flags');
    let badges = [];

    if (!flags.contains('3rdParty')) {
      badges.push({
        title: 'Keboola',
        description: `Support for this ${this.getAppType()} is provided by Keboola`,
        key: 'responsibility'
      });
    }
    if (flags.contains('3rdParty')) {
      badges.push({
        title: <span>3<sup>rd</sup> party</span>,
        description: `This is a 3rd party ${this.getAppType()} supported by its author`,
        key: '3rdParty'
      });
    }
    if (flags.contains('excludeFromNewList')) {
      badges.push({
        title: 'Alpha',
        description: `This ${this.getAppType()} is private`,
        key: 'excludeFromNewList'
      });
    }
    if (flags.contains('appInfo.dataIn')) {
      badges.push({
        title: <span><i className="fa fa-cloud-download fa-fw"/> IN</span>,
        description: `This ${this.getAppType()} extracts data from outside sources`,
        key: 'dataIn'
      });
    }
    if (flags.contains('appInfo.dataOut')) {
      badges.push({
        title: <span><i className="fa fa-cloud-upload fa-fw"/> OUT</span>,
        description: `This ${this.getAppType()} sends data outside of Keboola Connection`,
        key: 'dataOut'
      });
    }
    if (flags.contains('appInfo.fee')) {
      badges.push({
        title: <span><i className="fa fa-dollar fa-fw"/></span>,
        description: `There is an extra charge to use this ${this.getAppType()}`,
        key: 'fee'
      });
    }
    if (flags.contains('appInfo.redshiftOnly')) {
      badges.push({
        title: <span><i className="fa fa-database fa-fw"/></span>,
        description: `Redshift backend is required to use this ${this.getAppType()}`,
        key: 'redshift'
      });
    }
    if (flags.contains('appInfo.fullAccess')) {
      badges.push({
        title: <span><i className="fa fa-key fa-fw"/></span>,
        description: `This ${this.getAppType()} will have full access to the project including all its data.`,
        key: 'fullAccess'
      });
    }
    if (flags.contains('deprecated')) {
      badges.push({
        title: <span><i className="fa fa-exclamation-triangle fa-fw"/><i className="fa fa-clock-o fa-fw"/></span>,
        description: `This ${this.getAppType()} is deprecated`,
        key: 'deprecated'
      });
    }
    if (this.props.component.getIn(['vendor', 'licenseUrl'])) {
      badges.push({
        badge: <span><i className="fa fa-file-text-o fa-fw"/></span>,
        description: '<span>You agree to <a href={this.props.component.getIn(["vendor", "licenseUrl"])}>vendors license agreement</a></span>',
        key: 'license'
      });
    }
    return badges;
  },

  getAppType() {
    switch (this.props.component.get('type')) {
      case 'extractor':
        return 'extractor';
      case  'writer':
        return 'writer';
      case 'application':
        return 'application';
      default:
        'component';
    }
  }
});
