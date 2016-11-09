import React from 'react';

import { InstallButtonBase } from 'core/containers/InstallButton';
import {
  // CLOSE_INFO,
  DOWNLOADING,
  DISABLED,
  ENABLED,
  ENABLING,
  // INSTALL_CATEGORY,
  INSTALLING,
  INSTALLED,
  // SET_ENABLE_NOT_AVAILABLE,
  // SHOW_INFO,
  // THEME_TYPE,
  // UNINSTALL_CATEGORY,
  UNINSTALLED,
  UNINSTALLING,
  UNKNOWN,
  // validAddonTypes,
  // validInstallStates as validStates,
} from 'core/constants';
import { getFakeI18nInst, shallowRender } from 'tests/client/helpers';

describe.only('<InstallButton />', () => {
  function renderButton(props) {
    const i18n = getFakeI18nInst();
    const name = 'test-addon';
    return shallowRender(<InstallButtonBase i18n={i18n} name={name} {...props} />);
  }

  describe('Switch', () => {
    it('is disabled when UNKNOWN', () => {
      const button = renderButton({ status: UNKNOWN });
      assert.equal(button.props.disabled, true);
      assert.equal(button.props.checked, false);
    });

    it('is unchecked when DISABLED', () => {
      const button = renderButton({ status: DISABLED });
      assert.equal(button.props.disabled, false);
      assert.equal(button.props.checked, false);
      assert.include(button.props.label, 'test-addon is disabled');
      assert.include(button.props.label, 'Click to enable');
    });

    it('is unchecked when UNINSTALLED', () => {
      const button = renderButton({ status: UNINSTALLED });
      assert.equal(button.props.disabled, false);
      assert.equal(button.props.checked, false);
      assert.include(button.props.label, 'test-addon is uninstalled');
      assert.include(button.props.label, 'Click to install');
    });

    it('is checked when INSTALLED', () => {
      const button = renderButton({ status: INSTALLED });
      assert.equal(button.props.checked, true);
      assert.equal(button.props.disabled, false);
      assert.equal(button.props.success, true);
      assert.include(button.props.label, 'test-addon is installed');
      assert.include(button.props.label, 'Click to uninstall');
    });

    it('is checked when ENABLED', () => {
      const button = renderButton({ status: ENABLED });
      assert.equal(button.props.checked, true);
      assert.equal(button.props.disabled, false);
      assert.include(button.props.label, 'test-addon is installed and enabled');
      assert.include(button.props.label, 'Click to uninstall');
    });

    it('is checked with progress when DOWNLOADING', () => {
      const button = renderButton({ downloadProgress: 39, status: DOWNLOADING });
      assert.equal(button.props.checked, false);
      assert.equal(button.props.disabled, false);
      assert.equal(button.props.progress, 39);
      assert.equal(button.props.label, 'Downloading test-addon.');
    });

    it('is checked when INSTALLING', () => {
      const button = renderButton({ status: INSTALLING });
      assert.equal(button.props.checked, true);
      assert.equal(button.props.disabled, false);
      assert.equal(button.props.progress, Infinity);
      assert.equal(button.props.label, 'Installing test-addon.');
    });

    it('is checked when ENABLING', () => {
      const button = renderButton({ status: ENABLING });
      assert.equal(button.props.checked, true);
      assert.equal(button.props.disabled, false);
      assert.equal(button.props.progress, Infinity);
      assert.equal(button.props.label, 'Enabling test-addon.');
    });

    it('is not checked when UNINSTALLING', () => {
      const button = renderButton({ status: UNINSTALLING });
      assert.equal(button.props.checked, false);
      assert.equal(button.props.disabled, false);
      assert.include(button.props.label, 'Uninstalling test-addon');
    });

    it('throws on bogus status', () => {
      assert.throws(() => {
        renderButton({ status: 'BOGUS' });
      }, Error, 'Invalid add-on status');
    });
  });

  /**
   * Handlers *
   **/

  /*
  it('should call installTheme function on click when uninstalled theme', () => {
    const installTheme = sinon.spy();
    const guid = 'test-guid';
    const name = 'hai';
    const button = renderButton({
      installTheme,
      type: THEME_TYPE,
      guid,
      name,
      status: UNINSTALLED,
    });
    const themeData = button.themeData;
    const root = findDOMNode(button);
    Simulate.click(root);
    assert(installTheme.calledWith(themeData, guid, name));
  });

  it('should call install function on click when uninstalled', () => {
    const guid = '@foo';
    const name = 'hai';
    const install = sinon.spy();
    const i18n = getFakeI18nInst();
    const installURL = 'https://my.url/download';
    const button = renderButton({ guid, i18n, install, installURL, name, status: UNINSTALLED });
    const root = findDOMNode(button);
    Simulate.click(root);
    assert(install.calledWith());
  });

  it('should call enable function on click when uninstalled', () => {
    const guid = '@foo';
    const name = 'hai';
    const enable = sinon.spy();
    const i18n = getFakeI18nInst();
    const installURL = 'https://my.url/download';
    const button = renderButton({ guid, i18n, enable, installURL, name, status: DISABLED });
    const root = findDOMNode(button);
    Simulate.click(root);
    assert(enable.calledWith());
  });

  it('should call uninstall function on click when installed', () => {
    const guid = '@foo';
    const installURL = 'https://my.url/download';
    const name = 'hai';
    const type = 'whatevs';
    const uninstall = sinon.spy();
    const button = renderButton({ guid, installURL, name, status: INSTALLED, type, uninstall });
    const root = findDOMNode(button);
    Simulate.click(root);
    assert(uninstall.calledWith({ guid, installURL, name, type }));
  });

  it('should not throw for DISABLING', () => {
    renderButton({ status: DISABLING });
  });

  it('should not call anything on click when neither installed or uninstalled', () => {
    const install = sinon.stub();
    const uninstall = sinon.stub();
    const button = renderButton({ status: DOWNLOADING, install, uninstall });
    const root = findDOMNode(button);
    Simulate.click(root);
    assert.ok(!install.called);
    assert.ok(!uninstall.called);
  });
  */
});
