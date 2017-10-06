import React, { Component, PropTypes } from 'react';
import AuthorizationRow from '../../../../oauth-v2/react/AuthorizationRow';
import OAuthV2Actions from '../../../../oauth-v2/ActionCreators';
import {FormGroup} from 'react-bootstrap';
import {FormControl} from 'react-bootstrap';
import {ControlLabel} from 'react-bootstrap';
const FormControlStatic = FormControl.Static;

class OauthV2WriterRow extends Component {
  constructor(props) {
    super(props);
    this.deleteCredentials = this.deleteCredentials.bind(this);
  }

  render() {
    return (
      <div className="row">
        <form className="form form-horizontal">
          <FormGroup>
            <ControlLabel className="col-sm-2">
              Destination
            </ControlLabel>
            <FormControlStatic className="col-sm-10" componentClass="div">
              {this.props.renderComponent()}
            </FormControlStatic>
          </FormGroup>
        </form>
        <div className="form form-horizontal">
          <FormGroup>
            <ControlLabel className="col-sm-2">
              Authorization Status
            </ControlLabel>
            <FormControlStatic className="col-sm-10" componentClass="div">
            {this.renderAuthorizedInfo()}
            </FormControlStatic>
          </FormGroup>
        </div>
        {this.props.isAuthorized &&
          <form className="form form-horizontal">
            <FormGroup>
              <ControlLabel className="col-sm-2">
                Instant Upload
              </ControlLabel>
              <FormControlStatic className="col-sm-10" componentClass="div">
                {this.props.renderEnableUpload('<todo name>')}
              </FormControlStatic>
            </FormGroup>
          </form>
        }
      </div>
    );
  }

  renderAuthorizedInfo() {
    const credentialsId = `tde-${this.props.configId}`;
    return (
      <AuthorizationRow
        returnUrlSuffix={`oauth-redirect-${this.props.componentId}`}
        className={''}
        innerComponent={'div'}
        allowExternalAuthorization={false}
        id={credentialsId}
        configId={this.props.configId}
        componentId={this.props.componentId}
        credentials={this.props.oauthCredentials}
        isResetingCredentials={false}
        onResetCredentials={this.deleteCredentials}
        showHeader={false}
      />
    );
  }

  deleteCredentials() {
    OAuthV2Actions.deleteCredentials(this.props.componentId, `tde-${this.props.configId}`)
      .then(this.props.resetUploadTask);
  }
}
OauthV2WriterRow.propTypes = {
  configId: PropTypes.object.isRequired,
  oauthCredentials: PropTypes.object,
  componentId: PropTypes.object.isRequired,
  localState: PropTypes.object.isRequired,
  updateLocalState: PropTypes.func,
  setConfigDataFn: PropTypes.func,
  renderComponent: PropTypes.func,
  renderEnableUpload: PropTypes.func,
  isAuthorized: PropTypes.bool,
  resetUploadTask: PropTypes.func
};
export default OauthV2WriterRow;