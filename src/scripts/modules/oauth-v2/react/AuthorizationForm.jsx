import React, {PropTypes} from 'react';
import ComponentsStore from '../../components/stores/ComponentsStore';
import ApplicationStore from '../../../stores/ApplicationStore';
export default React.createClass({

  propTypes: {
    componentId: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    children: PropTypes.any,
    returnUrlSuffix: PropTypes.string
  },

  getDefaultProps() {
    return {

    };
  },

  render() {
    const oauthUrl = ComponentsStore.getComponent('keboola.oauth-v2').get('uri');
    const actionUrl = `${oauthUrl}/authorize/${this.props.componentId}`;
    const token = ApplicationStore.getSapiTokenString();
    const returnUrl = `${window.location.href}/${this.props.returnUrlSuffix}`;
    return (
      <form
        method="POST"
        action={actionUrl}
        className="form form-horizontal">
        {this.renderHiddenInput('token', token)}
        {this.renderHiddenInput('id', this.props.id)}
        {this.renderHiddenInput('returnUrl', returnUrl)}
        {this.props.children}
      </form>
    );
  },

  renderHiddenInput(name, value) {
    return (<input type="hidden" name={name} value={value}/>);
  }

});
