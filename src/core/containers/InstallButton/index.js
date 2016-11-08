import React, { PropTypes } from 'react';
import { compose } from 'redux';
import config from 'config';

import * as addonManager from 'core/addonManager';
import {
  CLOSE_INFO,
  DOWNLOADING,
  DISABLED,
  ENABLED,
  ENABLING,
  INSTALL_CATEGORY,
  INSTALLING,
  INSTALLED,
  SET_ENABLE_NOT_AVAILABLE,
  SHOW_INFO,
  THEME_TYPE,
  UNINSTALL_CATEGORY,
  UNINSTALLED,
  UNINSTALLING,
  UNKNOWN,
  validAddonTypes,
  validInstallStates as validStates,
} from 'core/constants';
import translate from 'core/i18n/translate';
import log from 'core/logger';
import InstallButton from 'ui/components/InstallButton';

export class InstallButtonBase extends React.Component {
  static propTypes = {
    i18n: PropTypes.object.isRequired,
    enable: PropTypes.func,
    guid: PropTypes.string.isRequired,
    install: PropTypes.func.isRequired,
    installTheme: PropTypes.func.isRequired,
    installURL: PropTypes.string,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    status: PropTypes.oneOf(validStates),
    type: PropTypes.oneOf(validAddonTypes),
    uninstall: PropTypes.func.isRequired,
  }

  static defaultProps = {
    status: UNKNOWN,
  }

  getLabel() {
    const { i18n, name, status } = this.props;
    let label;
    switch (status) {
      case DOWNLOADING:
        label = i18n.gettext('Downloading %(name)s.');
        break;
      case INSTALLING:
        label = i18n.gettext('Installing %(name)s.');
        break;
      case ENABLED:
      case INSTALLED:
        label = i18n.gettext('%(name)s is installed and enabled. Click to uninstall.');
        break;
      case DISABLED:
        label = i18n.gettext('%(name)s is disabled. Click to enable.');
        break;
      case UNINSTALLING:
        label = i18n.gettext('Uninstalling %(name)s.');
        break;
      case UNINSTALLED:
        label = i18n.gettext('%(name)s is uninstalled. Click to install.');
        break;
      default:
        label = i18n.gettext('Install state for %(name)s is unknown.');
        break;
    }
    return i18n.sprintf(label, { name });
  }

  handleClick = () => {
    const {
      guid, enable, install, installURL, name, status, installTheme, type, uninstall,
    } = this.props;
    if (type === THEME_TYPE && [UNINSTALLED, DISABLED].includes(status)) {
      installTheme(this.themeData, guid, name);
    } else if (status === UNINSTALLED) {
      install();
    } else if (status === DISABLED) {
      enable();
    } else if ([INSTALLED, ENABLED].includes(status)) {
      uninstall({ guid, installURL, name, type });
    }
  }

  render() {
    const { slug, status } = this.props;

    if (!validStates.includes(status)) {
      throw new Error('Invalid add-on status');
    }

    const isChecked = [INSTALLED, INSTALLING, ENABLING, ENABLED].includes(status);
    const isDisabled = status === UNKNOWN;
    // const progress = status === DOWNLOADING ? downloadProgress : undefined;
    return (
      <InstallButton
        checked={isChecked} disabled={isDisabled} progress={0} name={slug}
      />
    );
  }
}

export function mapStateToProps(state, ownProps, { _tracking = tracking } = {}) {
  const installation = state.installations[ownProps.guid] || {};
  return {
    ...installation,
    installTheme(node, guid, name, _themeAction = themeAction) {
      _themeAction(node, THEME_INSTALL);
      _tracking.sendEvent({ action: 'theme', category: INSTALL_CATEGORY, label: name });
    },
  };
}

export function makeProgressHandler(dispatch, guid) {
  return (addonInstall, e) => {
    if (addonInstall.state === 'STATE_DOWNLOADING') {
      const downloadProgress = parseInt(
        (100 * addonInstall.progress) / addonInstall.maxProgress, 10);
      dispatch({ type: DOWNLOAD_PROGRESS, payload: { guid, downloadProgress } });
    } else if (e.type === 'onDownloadFailed') {
      dispatch({ type: INSTALL_ERROR, payload: { guid, error: DOWNLOAD_FAILED } });
    } else if (e.type === 'onInstallFailed') {
      dispatch({ type: INSTALL_ERROR, payload: { guid, error: INSTALL_FAILED } });
    }
  };
}

export function mapDispatchToProps(dispatch, { _tracking = tracking,
                                               _addonManager = addonManager,
                                               ...ownProps } = {}) {
  if (config.get('server')) {
    return {};
  }

  function showInfo({ name, iconUrl }) {
    dispatch({
      type: SHOW_INFO,
      payload: {
        addonName: name,
        imageURL: iconUrl,
        closeAction: () => {
          dispatch({ type: CLOSE_INFO });
        },
      },
    });
  }

  return {
    setCurrentStatus({ guid, installURL }) {
      const payload = { guid, url: installURL };
      return _addonManager.getAddon(guid)
        .then(
          (addon) => {
            const status = addon.isActive && addon.isEnabled ? ENABLED : DISABLED;
            dispatch({
              type: INSTALL_STATE,
              payload: { ...payload, status },
            });
          },
          () => {
            log.info(`Add-on "${guid}" not found so setting status to UNINSTALLED`);
            dispatch({
              type: INSTALL_STATE,
              payload: { ...payload, status: UNINSTALLED },
            });
          }
        )
        .catch((err) => {
          log.error(err);
          // Dispatch a generic error should the success/error functions throw.
          dispatch({
            type: INSTALL_STATE,
            payload: { guid, status: ERROR, error: FATAL_ERROR },
          });
        });
    },

    enable({ _showInfo = showInfo } = {}) {
      const { guid, name, iconUrl, i18n } = ownProps;
      return _addonManager.enable(guid)
        .then(() => {
          _showInfo({ name, iconUrl, i18n });
        })
        .catch((err) => {
          if (err && err.message === SET_ENABLE_NOT_AVAILABLE) {
            log.info(`addon.setEnabled not available. Unable to enable ${guid}`);
          } else {
            log.error(err);
            dispatch({
              type: INSTALL_STATE,
              payload: { guid, status: ERROR, error: FATAL_ERROR },
            });
          }
        });
    },

    install() {
      const { guid, i18n, iconUrl, installURL, name } = ownProps;
      dispatch({ type: START_DOWNLOAD, payload: { guid } });
      return _addonManager.install(installURL, makeProgressHandler(dispatch, guid))
        .then(() => {
          _tracking.sendEvent({
            action: 'addon',
            category: INSTALL_CATEGORY,
            label: name,
          });
          showInfo({ name, iconUrl, i18n });
        })
        .catch((err) => {
          log.error(err);
          dispatch({
            type: INSTALL_STATE,
            payload: { guid, status: ERROR, error: FATAL_INSTALL_ERROR },
          });
        });
    },

    uninstall({ guid, name, type }) {
      dispatch({ type: INSTALL_STATE, payload: { guid, status: UNINSTALLING } });
      const action = getAction(type);
      return _addonManager.uninstall(guid)
        .then(() => {
          _tracking.sendEvent({
            action,
            category: UNINSTALL_CATEGORY,
            label: name,
          });
        })
        .catch((err) => {
          log.error(err);
          dispatch({
            type: INSTALL_STATE,
            payload: { guid, status: ERROR, error: FATAL_UNINSTALL_ERROR },
          });
        });
    },
  };
}

export default compose(
  translate,
)(InstallButtonBase);
