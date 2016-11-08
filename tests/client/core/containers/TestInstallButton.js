import InstallButton from 'core/containers/InstallButton';

describe('<InstallButton />', () => {
  it('is disabled if status is UNKNOWN', () => {
    assert.equal(button.props.disabled, true);
  });

  it('should reflect DISABLED status', () => {
    const button = renderButton({ status: DISABLED });
    const root = findDOMNode(button);
    const checkbox = root.querySelector('input[type=checkbox]');
    assert.equal(checkbox.hasAttribute('disabled'), false);
    assert.ok(root.classList.contains('disabled'));
    const label = root.querySelector('label');
    assert.include(label.textContent, 'test-addon is disabled');
    assert.include(label.textContent, 'Click to enable');
  });

  it('should reflect UNINSTALLED status', () => {
    const button = renderButton({ status: UNINSTALLED });
    const root = findDOMNode(button);
    const checkbox = root.querySelector('input[type=checkbox]');
    assert.equal(checkbox.hasAttribute('disabled'), false);
    assert.ok(root.classList.contains('uninstalled'));
    const label = root.querySelector('label');
    assert.include(label.textContent, 'test-addon is uninstalled');
    assert.include(label.textContent, 'Click to install');
  });

  it('should reflect INSTALLED status', () => {
    const button = renderButton({ status: INSTALLED });
    const root = findDOMNode(button);
    const checkbox = root.querySelector('input[type=checkbox]');
    assert.equal(checkbox.checked, true, 'checked is true');
    assert.ok(root.classList.contains('installed'));
  });

  it('should reflect ENABLED status', () => {
    const button = renderButton({ status: ENABLED });
    const root = findDOMNode(button);
    const checkbox = root.querySelector('input[type=checkbox]');
    assert.equal(checkbox.checked, true, 'checked is true');
    assert.ok(root.classList.contains('enabled'));
    const label = root.querySelector('label');
    assert.include(label.textContent, 'test-addon is installed and enabled');
    assert.include(label.textContent, 'Click to uninstall');
  });

  it('sets the label to downloading when downloading', () => {
    assert.equal(button.props.label, 'Downloading test-addon');
  });

  it('sets the label when installing', () => {});

  it('should reflect ENABLING status', () => {
    const button = renderButton({ status: ENABLING });
    const root = findDOMNode(button);
    assert.ok(root.classList.contains('enabling'));
    const checkbox = root.querySelector('input[type=checkbox]');
    assert.equal(checkbox.checked, true, 'checked is true');
  });

  it('should reflect uninstallation', () => {
    const button = renderButton({ status: UNINSTALLING });
    const root = findDOMNode(button);
    assert.ok(root.classList.contains('uninstalling'));
    const label = root.querySelector('label');
    assert.include(label.textContent, 'Uninstalling test-addon');
  });

  it('should throw on bogus status', () => {
    assert.throws(() => {
      renderButton({ status: 'BOGUS' });
    }, Error, 'Invalid add-on status');
  });

  it('should not throw for ENABLING', () => {
    renderButton({ status: ENABLING });
  });

  /************
   * Handlers *
   ************/

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
});
