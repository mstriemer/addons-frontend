/* global navigator, window */

import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { compose } from 'redux';

import 'core/fonts/fira.scss';
import 'amo/css/App.scss';
import SearchForm from 'amo/components/SearchForm';
import translate from 'core/i18n/translate';
import { addChangeListeners } from 'core/addonManager';
import { startLoginUrl } from 'core/api';
import { INSTALL_STATE } from 'core/constants';
import Footer from 'amo/components/Footer';
import MastHead from 'amo/components/MastHead';


export class AppBase extends React.Component {
  static propTypes = {
    FooterComponent: PropTypes.node.isRequired,
    MastHeadComponent: PropTypes.node.isRequired,
    children: PropTypes.node,
    handleGlobalEvent: PropTypes.func.isRequired,
    handleLogIn: PropTypes.func.isRequired,
    i18n: PropTypes.object.isRequired,
    isAuthenticated: PropTypes.bool,
    location: PropTypes.object.isRequired,
  }

  static defaultProps = {
    FooterComponent: Footer,
    MastHeadComponent: MastHead,
  }

  componentDidMount() {
    const { handleGlobalEvent } = this.props;
    // Use addonManager.addChangeListener to setup and filter events.
    addChangeListeners(handleGlobalEvent, navigator.mozAddonManager);
  }

  accountButton() {
    const { handleLogIn, i18n, isAuthenticated, location } = this.props;
    return (
      <button className="button AccountButton"
              onClick={() => handleLogIn(location)}
              ref={(ref) => { this.logInButton = ref; }}>
        <span>{ isAuthenticated ? i18n.gettext('Log out') : i18n.gettext('Log in/Sign up') }</span>
      </button>
    );
  }

  render() {
    const {
      FooterComponent, MastHeadComponent, children, i18n, location,
    } = this.props;
    const query = location.query ? location.query.q : null;
    return (
      <div className="amo">
        <Helmet defaultTitle={i18n.gettext('Add-ons for Firefox')} />
        <MastHeadComponent SearchFormComponent={SearchForm} query={query}>
          {this.accountButton()}
        </MastHeadComponent>
        <div className="App-content">
          {children}
        </div>
        <FooterComponent />
      </div>
    );
  }
}

export const setupMapStateToProps = (_window) => (state) => ({
  isAuthenticated: !!state.auth.token,
  handleLogIn(location) {
    // eslint-disable-next-line no-param-reassign
    (_window || window).location = startLoginUrl({ location });
  },
});

export const mapDispatchToProps = (dispatch) => ({
  handleGlobalEvent(payload) {
    dispatch({ type: INSTALL_STATE, payload });
  },
});

export default compose(
  connect(setupMapStateToProps(), mapDispatchToProps),
  translate({ withRef: true }),
)(AppBase);
