const STORAGE_KEY = 'redRobinAccessSystemState';
const DEFAULT_SETTINGS = {
  theme: 'dark',
  textSize: 16,
  backgroundColor: '#1d1d1f',
  showIcons: true,
  soundAlerts: true,
  notificationType: 'soft-beep',
  browserNotifications: false,
  networkRefresh: 'manual',
  bluetoothRefresh: 'manual',
  highContrast: false,
  reduceMotion: false,
  tooltips: true,
  autoScan: false,
  darkMode: true,
};

const defaultState = {
  account: null,
  auth: {
    failedAttempts: 0,
    lastBlockedUntil: 0,
    rememberMe: false,
  },
  settings: { ...DEFAULT_SETTINGS },
  loginHistory: [],
  network: {
    status: 'Connected',
    ip: '192.168.1.24',
    signal: 84,
    connectionType: 'Wi‑Fi 6',
    speedTest: { down: 254, up: 46 },
    lastUpdated: new Date().toISOString(),
    refreshInterval: 'manual',
    log: [
      { time: new Date().toISOString(), event: 'Internet connection established', value: '254 Mb/s' },
      { time: new Date(Date.now() - 3 * 60 * 1000).toISOString(), event: 'IP address confirmed', value: '192.168.1.24' }
    ],
  },
  bluetooth: {
    scanning: false,
    enabled: true,
    lastScanTime: new Date().toISOString(),
    autoScan: false,
    devices: [
      { id: 1, name: 'Bose Mini 2', type: 'Headphones', signal: 86, status: 'Connected', firstSeen: new Date(Date.now() - 18 * 60 * 1000).toISOString(), lastSeen: new Date().toISOString(), ignored: false },
      { id: 2, name: 'Office Speaker', type: 'Speaker', signal: 72, status: 'Nearby', firstSeen: new Date(Date.now() - 42 * 60 * 1000).toISOString(), lastSeen: new Date().toISOString(), ignored: false },
      { id: 3, name: 'Unknown Device', type: 'Unidentified', signal: 41, status: 'Nearby', firstSeen: new Date(Date.now() - 6 * 60 * 1000).toISOString(), lastSeen: new Date().toISOString(), ignored: false },
    ],
    history: [
      { time: new Date().toISOString(), event: 'Bluetooth scan completed', detail: '3 devices detected nearby' },
      { time: new Date(Date.now() - 10 * 60 * 1000).toISOString(), event: 'Device connected', detail: 'Bose Mini 2' }
    ],
  },
  alerts: [
    { id: 1, time: new Date().toISOString(), title: 'Background sync completed', detail: 'Your laptop completed a routine sync without issue.', severity: 'Information', reviewed: false, dismissed: false },
    { id: 2, time: new Date(Date.now() - 12 * 60 * 1000).toISOString(), title: 'Unusual network pattern', detail: 'An unfamiliar device was seen in the last scan. Review the device list for context.', severity: 'Caution', reviewed: false, dismissed: false },
  ],
  archive: [
    { id: 3, time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), title: 'Network traffic spike', detail: 'High data usage detected for a short period.', severity: 'Warning', reviewed: true, dismissed: true },
  ],
  devices: {
    selectedDeviceId: 'drive-1',
    devices: [
      { id: 'drive-1', name: 'My Passport', type: 'External HDD', total: 1000, used: 540, files: [
        { id: 'file-1', name: 'backup.zip', type: 'Archive', size: 84, ext: '.zip', modified: new Date(Date.now() - 86400000).toISOString(), created: new Date(Date.now() - 4 * 86400000).toISOString(), opened: new Date(Date.now() - 3 * 86400000).toISOString(), path: '/backup.zip' },
        { id: 'file-2', name: 'notes.txt', type: 'Text', size: 18, ext: '.txt', modified: new Date(Date.now() - 2 * 3600000).toISOString(), created: new Date(Date.now() - 7 * 86400000).toISOString(), opened: new Date(Date.now() - 3600000).toISOString(), path: '/notes.txt' },
        { id: 'file-3', name: 'holiday.jpg', type: 'Image', size: 2.6, ext: '.jpg', modified: new Date(Date.now() - 25 * 3600000).toISOString(), created: new Date(Date.now() - 22 * 86400000).toISOString(), opened: new Date(Date.now() - 14 * 86400000).toISOString(), path: '/holiday.jpg' },
      ] },
      { id: 'drive-2', name: 'SD Card', type: 'Memory Card', total: 256, used: 76, files: [
        { id: 'file-4', name: 'photos', type: 'Folder', size: 0, ext: 'folder', modified: new Date(Date.now() - 3600000).toISOString(), created: new Date(Date.now() - 12 * 86400000).toISOString(), opened: new Date(Date.now() - 3600000).toISOString(), path: '/photos' },
      ] },
    ],
    selectedFileId: null,
    currentFolder: '/',
    sortMode: 'name',
    searchTerm: '',
    folderHistory: ['/'],
    folderIndex: 0,
  },
  transfers: {
    active: [
      { id: 1, name: 'IMG_4321.jpg', source: 'My Passport', destination: 'My Computer', size: '2.4 MB', progress: 66, speed: '1.8 MB/s', remaining: '00:08', status: 'active' },
      { id: 2, name: 'backup.zip', source: 'My Computer', destination: 'SD Card', size: '84 MB', progress: 31, speed: '5.4 MB/s', remaining: '00:45', status: 'active' }
    ],
    history: [
      { id: 3, name: 'final-report.pdf', source: 'My Computer', destination: 'My Passport', size: '7.2 MB', finishedAt: new Date(Date.now() - 4 * 3600000).toISOString(), status: 'success' },
      { id: 4, name: 'image_002.png', source: 'My Passport', destination: 'My Computer', size: '1.9 MB', finishedAt: new Date(Date.now() - 9 * 3600000).toISOString(), status: 'failed' },
    ]
  },
  page: 'dashboardPage',
};

let appState = loadState();
let inactivityTimer = null;
let refreshTimer = null;
let transferInterval = null;
let alertSequence = 4;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    return mergeState(parsed);
  } catch (err) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function mergeState(state) {
  const merged = JSON.parse(JSON.stringify(defaultState));
  return { ...merged, ...state, settings: { ...merged.settings, ...(state.settings || {}) }, auth: { ...merged.auth, ...(state.auth || {}) }, network: { ...merged.network, ...(state.network || {}), log: state.network?.log || merged.network.log }, bluetooth: { ...merged.bluetooth, ...(state.bluetooth || {}) }, alerts: state.alerts || merged.alerts, archive: state.archive || merged.archive, devices: { ...merged.devices, ...(state.devices || {}) }, transfers: { ...merged.transfers, ...(state.transfers || {}) }, loginHistory: state.loginHistory || merged.loginHistory };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function safeDate(value) {
  return new Date(value || Date.now()).toLocaleString();
}

function notEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

const TERMS_TEXT = `
  <div class="terms-modal-content">
    <h3>RED ROBIN'S ACCESS SYSTEM — TERMS AND CONDITIONS</h3>
    <p><strong>Last Updated:</strong> 13 October 2026</p>

    <ol>
      <li>
        <h4>1. ACCEPTANCE OF TERMS</h4>
        <p>By accessing, creating an account, or using Red Robin's Access System, you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions. If you do not agree with every statement contained here, you are not permitted to create an account or use this system. Continued use of the system after any updates constitutes acceptance of the revised terms.</p>
      </li>
      <li>
        <h4>2. SYSTEM PURPOSE AND INTENDED USE</h4>
        <p>Red Robin's Access System is designed and developed exclusively for personal device management, monitoring, and administration of equipment and data that you legally own or have been granted explicit written permission to manage. This system is intended to provide visibility and control over your own computing environment — it is not designed, intended, or authorised for use as a surveillance tool, network intruder, or data retrieval tool targeting any person, device, or network that is not your property.</p>
      </li>
      <li>
        <h4>3. DEFINITION OF PERMITTED USE</h4>
        <p>You are permitted to use this system only for the following lawful purposes:</p>
        <ul>
          <li>Monitoring the internet connection status, speed, and activity of your own personal device</li>
          <li>Scanning for and identifying Bluetooth devices within range that belong to you</li>
          <li>Viewing, opening, copying, moving, renaming, and managing files stored on external storage devices that you own or have written permission to access</li>
          <li>Transferring files between your own devices or between devices you have permission to use</li>
          <li>Reviewing system alerts, logs, and notifications generated by activity on your own equipment</li>
          <li>Managing your own account, security settings, and preferences within the system</li>
        </ul>
        <p>All uses listed above apply only when the device, file, network, or signal is your property or when you hold clear, verifiable, written permission from the rightful owner.</p>
      </li>
      <li>
        <h4>4. DEFINITION OF PROHIBITED AND ILLEGAL USE</h4>
        <p>The following actions are strictly forbidden and may constitute criminal offences under applicable laws including but not limited to the Computer Misuse Act 1990 (United Kingdom) and similar legislation internationally:</p>
        <ul>
          <li>Accessing, scanning, or monitoring any device, computer, network, or storage drive that you do not own and for which you have not received explicit written permission from the owner</li>
          <li>Attempting to retrieve, view, copy, or alter files, data, settings, or information belonging to another person or organisation</li>
          <li>Using the Bluetooth scanner to connect to, pair with, or extract information from devices that are not your own without consent</li>
          <li>Using the network monitoring features to identify, target, or interact with other devices connected to a shared network that are not your property</li>
          <li>Sharing your PIN, account access, or system data with third parties for the purpose of accessing or examining equipment that belongs to others</li>
          <li>Using the system to bypass security measures, passwords, or access controls on any device not owned by you</li>
          <li>Repurposing, modifying, or distributing this system specifically for illegal or unauthorised activities</li>
        </ul>
      </li>
      <li>
        <h4>5. OWNERSHIP AND PERMISSION REQUIREMENT</h4>
        <p>For every device, file, network connection, or data item you access through this system:</p>
        <ul>
          <li>"Owned" means you are the legal purchaser or assigned owner of the device and hold full authority to manage it</li>
          <li>"Permission" means you have received dated, written consent from the legal owner specifically naming you and describing the scope of access granted</li>
          <li>Verbal permission is not considered sufficient under these terms — written confirmation must be obtained and retained</li>
          <li>You are solely responsible for proving ownership or permission if questioned or challenged regarding any activity carried out through your account</li>
        </ul>
      </li>
      <li>
        <h4>6. YOUR RESPONSIBILITIES AS A USER</h4>
        <p>As the account holder you accept full and personal responsibility for every action taken under your account. This includes:</p>
        <ul>
          <li>Keeping your PIN confidential and never sharing it with anyone else</li>
          <li>Ensuring no other person uses your account or device to access the system</li>
          <li>Logging out or locking your account whenever you step away from your computer</li>
          <li>Reviewing all alerts, logs, and activity reports regularly</li>
          <li>Ceasing use immediately if you suspect your PIN or device has been compromised</li>
          <li>Checking these terms periodically for updates or changes</li>
          <li>Using the system in a careful, lawful, and ethical manner at all times</li>
        </ul>
      </li>
      <li>
        <h4>7. DATA STORAGE, PRIVACY, AND SECURITY</h4>
        <ul>
          <li>All data collected, logged, and displayed by this system is stored locally on your own device using browser storage. No data is transmitted to external servers, cloud platforms, or third-party services at any time</li>
          <li>Your PIN is stored only on your device and is never sent across the internet</li>
          <li>You are responsible for backing up your own logs and data if you wish to preserve them</li>
          <li>If you delete your account or clear your browser data, all records, settings, and history will be permanently removed and cannot be recovered</li>
          <li>This system does not collect cookies, analytics, or usage statistics — your activity remains entirely within your own browser environment</li>
        </ul>
      </li>
      <li>
        <h4>8. NO WARRANTIES OR GUARANTEES</h4>
        <p>Red Robin's Access System is provided on an "as is" and "as available" basis. No warranties, express or implied, are made regarding:</p>
        <ul>
          <li>The accuracy, completeness, or reliability of detected network, Bluetooth, or file information</li>
          <li>Whether the system will detect every potential security risk, threat, or unauthorised activity</li>
          <li>Continuous error-free operation or compatibility with all devices, browsers, or operating systems</li>
          <li>Suitability for any specific purpose beyond basic personal device monitoring</li>
        </ul>
        <p>This system is NOT a replacement for professional antivirus software, firewall protection, or certified cybersecurity tools. It should be used alongside established trusted security products and safe computing practices.</p>
      </li>
      <li>
        <h4>9. CONSEQUENCES OF VIOLATION</h4>
        <ul>
          <li>Any violation of these terms — including but not limited to unauthorised access — may result in immediate permanent suspension of your ability to use the system</li>
          <li>You accept full personal legal liability for any illegal activity conducted through your account</li>
          <li>Affected parties, law enforcement bodies, or regulatory authorities may take legal action against you in the event of misuse</li>
          <li>You agree to indemnify and hold harmless the creators and developers of this system from any claims, damages, or legal actions arising from your improper or illegal use</li>
          <li>The creators of this system are not liable for any consequences resulting from your actions</li>
        </ul>
      </li>
      <li>
        <h4>10. LEGAL GOVERNANCE AND JURISDICTION</h4>
        <ul>
          <li>These Terms and Conditions are governed by and construed in accordance with the laws of England and Wales</li>
          <li>Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the courts of the United Kingdom</li>
          <li>If any provision of these terms is found to be unenforceable or unlawful, the remaining provisions shall remain in full force and effect</li>
          <li>The failure to enforce any provision of these terms does not constitute a waiver of that provision or any other</li>
        </ul>
      </li>
      <li>
        <h4>11. CHANGES TO TERMS</h4>
        <ul>
          <li>These Terms and Conditions may be updated, revised, or expanded as new features are introduced or legal requirements change</li>
          <li>When terms are updated, you will be required to review and re-agree to the new version before continuing to use the system</li>
          <li>Continued use of the system after changes have been posted constitutes your acceptance of the revised terms</li>
        </ul>
      </li>
      <li>
        <h4>12. ACKNOWLEDGEMENT</h4>
        <p>By ticking the box and creating your account, you declare that you are at least 13 years of age or have parental/guardian consent, you have read and understood every section of these Terms and Conditions, and you agree to comply fully with all requirements and legal obligations stated above.</p>
        <p><strong>Signed / Agreed:</strong></p>
        <p>Account Holder Name / Display Name: ________________________</p>
        <p>Date: ________________________</p>
      </li>
    </ol>

    <button class="primary-button full-width" type="button" data-action="close-terms">I Have Read — Return to Registration</button>
  </div>
`;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function openTermsModal(returnTarget) {
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCard = document.getElementById('modalCard');
  if (!modalBackdrop || !modalCard) return;
  modalCard.innerHTML = TERMS_TEXT;
  modalBackdrop.classList.remove('hidden');
  window.redRobinTermsReturnTarget = returnTarget || 'registerView';
}

function closeTermsModal() {
  const modalBackdrop = document.getElementById('modalBackdrop');
  if (modalBackdrop) modalBackdrop.classList.add('hidden');
  const target = window.redRobinTermsReturnTarget || 'registerView';
  if (target === 'registerView') {
    showAuthArea('registerView');
  } else if (target === 'loginView') {
    showAuthArea('loginView');
  } else if (target === 'settingsPage') {
    setPage('settingsPage');
  }
}

function formatPin(pin) {
  return String(pin || '').trim();
}

function isDigitPin(pin) {
  return /^\d{4,6}$/.test(String(pin || '').trim());
}

function validateRegisterForm() {
  const form = document.getElementById('registerForm');
  const username = form.username.value.trim();
  const displayName = form.displayName.value.trim();
  const question = form.question.value.trim();
  const answer = form.answer.value.trim();
  const pin = form.pin.value.trim();
  const confirmPin = form.confirmPin.value.trim();
  const termsCheckbox = document.getElementById('termsCheckbox');
  const fields = [form.username, form.displayName, form.question, form.answer, form.pin, form.confirmPin];
  const errorNode = document.getElementById('registerError');

  for (const field of fields) {
    field.classList.remove('invalid');
  }

  const hasAnyInput = fields.some((field) => field.value.trim().length > 0) || (termsCheckbox && termsCheckbox.checked);
  if (!hasAnyInput) {
    errorNode.textContent = '';
    errorNode.classList.add('hidden');
    return false;
  }

  if (!username || !displayName || !question || !answer || !pin || !confirmPin) {
    errorNode.textContent = 'Please fill in all fields before continuing.';
    errorNode.classList.remove('hidden');
    fields.forEach((field) => {
      if (!field.value.trim()) field.classList.add('invalid');
    });
    return false;
  }

  if (!isDigitPin(pin)) {
    errorNode.textContent = 'PIN must be 4 to 6 digits.';
    errorNode.classList.remove('hidden');
    form.pin.classList.add('invalid');
    return false;
  }

  if (pin !== confirmPin) {
    errorNode.textContent = 'PINs do not match — please try again.';
    errorNode.classList.remove('hidden');
    form.pin.classList.add('invalid');
    form.confirmPin.classList.add('invalid');
    return false;
  }

  if (termsCheckbox && !termsCheckbox.checked) {
    errorNode.textContent = 'Please review and accept the Terms and Conditions to continue.';
    errorNode.classList.remove('hidden');
    return false;
  }

  errorNode.textContent = '';
  errorNode.classList.add('hidden');
  return true;
}

function updateCreateAccountState() {
  const form = document.getElementById('registerForm');
  const button = document.getElementById('createAccountBtn');
  const termsCheckbox = document.getElementById('termsCheckbox');
  if (!form) return;
  const valid = validateRegisterForm();
  button.disabled = !(valid && (!termsCheckbox || termsCheckbox.checked));
}

function showAuthArea(viewName) {
  const tabs = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.auth-panel');
  tabs.forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
  panels.forEach((panel) => panel.classList.toggle('active', panel.id === viewName));
}

function showMainApp() {
  document.getElementById('authView').classList.remove('active');
  document.getElementById('mainAppView').classList.add('active');
}

function showAuthView() {
  document.getElementById('authView').classList.add('active');
  document.getElementById('mainAppView').classList.remove('active');
}

function setPage(pageId) {
  appState.page = pageId;
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === pageId);
  });
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.toggle('active', page.id === pageId);
  });
}

function loginUser() {
  const account = appState.account;
  if (!account) return;
  appState.account.lastLoginAt = new Date().toISOString();
  appState.auth.failedAttempts = 0;
  appState.auth.lastBlockedUntil = 0;
  appState.loginHistory.unshift({
    time: new Date().toISOString(),
    success: true,
    note: 'Successful login',
  });
  saveState();
  renderDashboard();
  showMainApp();
  showToast(`Account created successfully — welcome to Red Robin's Access System, ${account.displayName}.`);
  resetInactivityTimer();
}

function logoutUser(message) {
  const label = message || 'You have been logged out due to inactivity — please enter your PIN to continue.';
  appState.account = null;
  saveState();
  showAuthView();
  showAuthArea('loginView');
  const errorNode = document.getElementById('loginError');
  errorNode.textContent = label;
  errorNode.classList.remove('hidden');
  errorNode.classList.add('error');
  document.getElementById('loginPin').value = '';
  setLoginPinVisibility(false);
  resetInactivityTimer();
}

function attemptLogin() {
  const pin = formatPin(document.getElementById('loginPin').value);
  const errorNode = document.getElementById('loginError');
  const now = Date.now();
  const lockUntil = Number(appState.auth.lastBlockedUntil || 0);

  if (lockUntil > now) {
    const ttl = Math.ceil((lockUntil - now) / 1000);
    errorNode.textContent = `Too many attempts — please wait ${ttl} seconds before trying again.`;
    errorNode.classList.remove('hidden');
    document.getElementById('loginPin').classList.add('shake');
    setTimeout(() => document.getElementById('loginPin').classList.remove('shake'), 350);
    return;
  }

  if (!appState.account) {
    errorNode.textContent = 'No account exists yet. Please create an account first.';
    errorNode.classList.remove('hidden');
    return;
  }

  if (pin === appState.account.pin) {
    appState.loginHistory.unshift({
      time: new Date().toISOString(),
      success: true,
      note: 'Successful login',
    });
    appState.auth.failedAttempts = 0;
    appState.auth.lastBlockedUntil = 0;
    appState.account.lastLoginAt = new Date().toISOString();
    saveState();
    showMainApp();
    showToast(`Welcome back, ${appState.account.displayName}.`);
    renderDashboard();
    resetInactivityTimer();
    return;
  }

  appState.auth.failedAttempts += 1;
  appState.loginHistory.unshift({
    time: new Date().toISOString(),
    success: false,
    note: 'Incorrect PIN entered',
  });

  if (appState.auth.failedAttempts >= 5) {
    appState.auth.lastBlockedUntil = Date.now() + 30000;
    errorNode.textContent = 'Too many attempts — please wait 30 seconds before trying again.';
    document.getElementById('loginPin').value = '';
    document.getElementById('loginPin').classList.add('shake');
    setTimeout(() => document.getElementById('loginPin').classList.remove('shake'), 350);
    saveState();
    return;
  }

  errorNode.textContent = 'Incorrect PIN — please try again';
  errorNode.classList.remove('hidden');
  document.getElementById('loginPin').value = '';
  document.getElementById('loginPin').classList.add('shake');
  setTimeout(() => document.getElementById('loginPin').classList.remove('shake'), 350);
  saveState();
}

function setLoginPinVisibility(visible) {
  const pinInput = document.getElementById('loginPin');
  const toggleButton = document.getElementById('togglePinVisibility');
  if (!pinInput || !toggleButton) return;
  pinInput.type = visible ? 'text' : 'password';
  toggleButton.textContent = visible ? '🙈' : '👁';
}

function registerAccount(event) {
  event.preventDefault();
  const form = event.target;
  if (!validateRegisterForm()) return;

  const account = {
    username: form.username.value.trim(),
    displayName: form.displayName.value.trim(),
    securityQuestion: form.question.value.trim(),
    securityAnswer: form.answer.value.trim().toLowerCase(),
    pin: form.pin.value.trim(),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  appState.account = account;
  appState.auth.failedAttempts = 0;
  appState.auth.lastBlockedUntil = 0;
  saveState();
  renderDashboard();
  loginUser();
  form.reset();
  showAuthArea('loginView');
}

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (appState.account) {
      logoutUser('You have been logged out due to inactivity — please enter your PIN to continue.');
    }
  }, 30 * 60 * 1000);
}

function trackInteraction() {
  if (appState.account) resetInactivityTimer();
}

function renderDashboard() {
  const account = appState.account;
  const dashboardWelcome = document.getElementById('dashboardWelcome');
  const accountInfo = document.getElementById('accountInfo');
  const dashboardHistory = document.getElementById('dashboardHistory');
  const summaryGrid = document.getElementById('dashboardSummary');

  if (!account) return;

  dashboardWelcome.textContent = `Welcome, ${account.displayName}`;

  const metricCards = [
    { label: 'Total alerts', value: appState.alerts.filter((item) => !item.dismissed && !item.reviewed).length + appState.archive.length },
    { label: 'Active warnings', value: appState.alerts.filter((item) => item.severity === 'Warning' && !item.dismissed).length },
    { label: 'Safe events', value: appState.alerts.filter((item) => item.severity === 'Information').length },
    { label: 'Last activity', value: safeDate(account.lastLoginAt || account.createdAt) },
  ];

  summaryGrid.innerHTML = metricCards.map((card) => `
    <div class="metric-card">
      <h3>${card.label}</h3>
      <p class="metric-value">${card.value}</p>
    </div>
  `).join('');

  accountInfo.innerHTML = `
    <div class="info-row"><span>Username</span><strong>${account.username}</strong></div>
    <div class="info-row"><span>Display Name</span><strong>${account.displayName}</strong></div>
    <div class="info-row"><span>Created</span><strong>${safeDate(account.createdAt)}</strong></div>
    <div class="info-row"><span>Last successful login</span><strong>${safeDate(account.lastLoginAt || account.createdAt)}</strong></div>
  `;

  const recent = appState.loginHistory.slice(0, 6);
  dashboardHistory.innerHTML = recent.map((entry) => `
    <div class="history-item">
      <div>
        <strong>${entry.note}</strong><br />
        <small>${safeDate(entry.time)}</small>
      </div>
      <span class="${entry.success ? 'success-tag' : 'warning-tag'}">${entry.success ? 'Success' : 'Failed'}</span>
    </div>
  `).join('') || '<div class="history-item">No activity yet.</div>';
}

function renderNetwork() {
  const summary = document.getElementById('networkSummary');
  const connections = document.getElementById('networkConnections');
  const log = document.getElementById('networkLog');
  const refreshSelect = document.getElementById('refreshIntervalSelect');

  if (refreshSelect) refreshSelect.value = appState.network.refreshInterval || 'manual';

  const info = [
    { label: 'Status', value: appState.network.status },
    { label: 'Public IP', value: appState.network.ip },
    { label: 'Signal strength', value: `${appState.network.signal}%` },
    { label: 'Connection type', value: appState.network.connectionType },
  ];

  summary.innerHTML = info.map((item) => `
    <div class="metric-card">
      <h3>${item.label}</h3>
      <p class="metric-value">${item.value}</p>
    </div>
  `).join('');

  const rows = [
    { host: 'gateway.local', type: 'Router', duration: '03:41', sent: '8.2 MB', received: '22.4 MB' },
    { host: 'api.redrobin.test', type: 'Secure Web', duration: '09:16', sent: '4.9 MB', received: '13.8 MB' },
    { host: 'cloud.storage.local', type: 'Backup', duration: '00:52', sent: '1.7 MB', received: '9.1 MB' }
  ];

  connections.innerHTML = rows.map((row) => `
    <div class="table-row">
      <strong>${row.host}</strong>
      <small>${row.type} · Active ${row.duration}</small>
      <div class="info-row"><span>Sent</span><strong>${row.sent}</strong></div>
      <div class="info-row"><span>Received</span><strong>${row.received}</strong></div>
    </div>
  `).join('');

  log.innerHTML = appState.network.log.slice(0, 8).map((entry) => `
    <div class="history-item">
      <div>
        <strong>${entry.event}</strong><br />
        <small>${entry.value}</small>
      </div>
      <small>${safeDate(entry.time)}</small>
    </div>
  `).join('');
}

function renderBluetooth() {
  const summary = document.getElementById('bluetoothSummary');
  const list = document.getElementById('bluetoothList');
  const history = document.getElementById('bluetoothHistory');
  const toggle = document.getElementById('bluetoothMasterToggle');
  if (toggle) toggle.checked = appState.bluetooth.scanning;

  const metrics = [
    { label: 'Bluetooth enabled', value: appState.bluetooth.enabled ? 'Enabled' : 'Disabled' },
    { label: 'Nearby devices', value: appState.bluetooth.devices.length },
    { label: 'Last scan', value: safeDate(appState.bluetooth.lastScanTime) },
    { label: 'Auto-scan', value: appState.bluetooth.autoScan ? 'On' : 'Off' },
  ];

  summary.innerHTML = metrics.map((item) => `
    <div class="metric-card">
      <h3>${item.label}</h3>
      <p class="metric-value">${item.value}</p>
    </div>
  `).join('');

  list.innerHTML = appState.bluetooth.devices.map((device) => `
    <div class="device-item ${device.ignored ? 'ignored' : ''}" style="border-color:${device.signal > 70 ? 'rgba(199,109,47,0.7)' : 'rgba(255,255,255,0.08)'};">
      <div class="transfer-header">
        <strong>${device.name}</strong>
        <span>${device.signal}%</span>
      </div>
      <small>${device.type} · ${device.status}</small>
      <div class="action-buttons">
        <button class="small-button" data-action="toggle-ignore" data-device-id="${device.id}">${device.ignored ? 'Restore alerts' : 'Ignore Device'}</button>
      </div>
    </div>
  `).join('');

  history.innerHTML = appState.bluetooth.history.slice(0, 8).map((entry) => `
    <div class="history-item">
      <div>
        <strong>${entry.event}</strong><br />
        <small>${entry.detail}</small>
      </div>
      <small>${safeDate(entry.time)}</small>
    </div>
  `).join('');
}

function renderThreats() {
  const summary = document.getElementById('threatSummary');
  const alertsFeed = document.getElementById('alertsFeed');
  const archive = document.getElementById('alertArchive');

  const metrics = [
    { label: 'Alerts recorded', value: appState.alerts.length + appState.archive.length },
    { label: 'Warnings active', value: appState.alerts.filter((item) => item.severity === 'Warning' && !item.dismissed).length },
    { label: 'Safe events', value: appState.alerts.filter((item) => item.severity === 'Information').length },
    { label: 'Last checked', value: new Date().toLocaleString() },
  ];

  summary.innerHTML = metrics.map((item) => `
    <div class="metric-card">
      <h3>${item.label}</h3>
      <p class="metric-value">${item.value}</p>
    </div>
  `).join('');

  alertsFeed.innerHTML = appState.alerts.map((alert) => `
    <div class="alert-item ${alert.severity.toLowerCase()} ${alert.reviewed ? 'reviewed' : ''}">
      <div class="alert-header">
        <strong>${alert.title}</strong>
        <span class="alert-type">${alert.severity}</span>
      </div>
      <small>${safeDate(alert.time)}</small>
      <p>${alert.detail}</p>
      <div class="alert-actions">
        <button class="small-button" data-action="review-alert" data-alert-id="${alert.id}">Mark as Reviewed</button>
        <button class="small-button" data-action="dismiss-alert" data-alert-id="${alert.id}">Dismiss</button>
        <button class="small-button" data-action="investigate-alert" data-alert-id="${alert.id}">Investigate</button>
      </div>
    </div>
  `).join('');

  archive.innerHTML = appState.archive.map((entry) => `
    <div class="history-item">
      <div>
        <strong>${entry.title}</strong><br />
        <small>${entry.detail}</small>
      </div>
      <div>
        <strong>${entry.severity}</strong><br />
        <small>${safeDate(entry.time)}</small>
      </div>
    </div>
  `).join('');
}

function renderDevices() {
  const cards = document.getElementById('deviceCards');
  const deviceList = document.getElementById('fileList');
  const selectedPanel = document.getElementById('selectedFilePanel');

  const deviceData = appState.devices.devices;
  const selectedDeviceId = appState.devices.selectedDeviceId;
  cards.innerHTML = deviceData.map((device) => {
    const usedPct = Math.round((device.used / device.total) * 100);
    return `
      <div class="device-card ${selectedDeviceId === device.id ? 'active' : ''}" data-device-id="${device.id}">
        <h4>${device.name}</h4>
        <div>${device.type}</div>
        <div class="storage-bar"><span style="width:${usedPct}%"></span></div>
        <div>${device.used} GB used / ${device.total} GB</div>
        <div class="action-buttons">
          <button class="small-button" data-action="select-device" data-device-id="${device.id}">Open</button>
          <button class="small-button" data-action="eject-device" data-device-id="${device.id}">Safely Eject</button>
        </div>
      </div>
    `;
  }).join('');

  const selectedDevice = deviceData.find((device) => device.id === selectedDeviceId) || deviceData[0];
  const files = selectedDevice?.files || [];
  const sorted = sortFiles(files, appState.devices.sortMode, appState.devices.searchTerm);
  deviceList.innerHTML = sorted.map((file) => `
    <div class="file-item ${appState.devices.selectedFileId === file.id ? 'selected' : ''}" data-action="select-file" data-file-id="${file.id}">
      <div class="file-name">
        <span>${file.type === 'Folder' ? '📁' : '📄'}</span>
        <span>${file.name}</span>
      </div>
      <div class="file-meta">${file.size || 'Folder'} • ${file.type}</div>
    </div>
  `).join('') || '<div class="file-item">No files match this filter.</div>';

  const selectedFile = sorted.find((file) => file.id === appState.devices.selectedFileId) || sorted[0] || null;
  if (!selectedFile) {
    selectedPanel.innerHTML = '<p>No file selected.</p>';
    return;
  }

  selectedPanel.innerHTML = `
    <div><strong>Full name:</strong> ${selectedFile.name}</div>
    <div><strong>Type:</strong> ${selectedFile.type}</div>
    <div><strong>Size:</strong> ${selectedFile.size} MB</div>
    <div><strong>Location:</strong> ${selectedFile.path}</div>
    <div><strong>Created:</strong> ${safeDate(selectedFile.created)}</div>
    <div><strong>Last opened:</strong> ${safeDate(selectedFile.opened)}</div>
    <div><strong>Last modified:</strong> ${safeDate(selectedFile.modified)}</div>
    <div class="action-buttons">
      <button class="small-button" data-action="preview-file" data-file-id="${selectedFile.id}">Open / Preview</button>
      <button class="small-button" data-action="copy-to-computer" data-file-id="${selectedFile.id}">Copy to My Computer</button>
      <button class="small-button" data-action="copy-to-device" data-file-id="${selectedFile.id}">Copy to Device</button>
      <button class="small-button" data-action="rename-file" data-file-id="${selectedFile.id}">Rename</button>
      <button class="danger-button" data-action="delete-file" data-file-id="${selectedFile.id}">Delete</button>
    </div>
  `;
}

function sortFiles(files, mode, searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  let filtered = files.filter((file) => !term || file.name.toLowerCase().includes(term));

  if (mode === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (mode === 'date-desc') filtered.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  if (mode === 'date-asc') filtered.sort((a, b) => new Date(a.modified) - new Date(b.modified));
  if (mode === 'size-desc') filtered.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
  if (mode === 'type') filtered.sort((a, b) => (a.type || '').localeCompare(b.type || ''));
  return filtered;
}

function renderTransfers() {
  const active = document.getElementById('activeTransfers');
  const history = document.getElementById('transferHistory');

  active.innerHTML = appState.transfers.active.map((transfer) => `
    <div class="transfer-item">
      <div class="transfer-header">
        <strong>${transfer.name}</strong>
        <small>${transfer.size}</small>
      </div>
      <div class="transfer-meta">
        <span>From: ${transfer.source}</span>
        <span>To: ${transfer.destination}</span>
      </div>
      <div>Progress: ${transfer.progress}% · Speed: ${transfer.speed} · Remaining: ${transfer.remaining}</div>
      <div class="progress-track"><div class="progress-bar" style="width:${transfer.progress}%"></div></div>
      <div class="transfer-actions">
        <button class="small-button" data-action="pause-transfer" data-transfer-id="${transfer.id}">Pause</button>
        <button class="small-button" data-action="resume-transfer" data-transfer-id="${transfer.id}">Resume</button>
        <button class="danger-button" data-action="cancel-transfer" data-transfer-id="${transfer.id}">Cancel</button>
      </div>
    </div>
  `).join('') || '<div class="transfer-item">No active transfers.</div>';

  history.innerHTML = appState.transfers.history.map((transfer) => `
    <div class="transfer-item">
      <div class="transfer-header">
        <strong>${transfer.name}</strong>
        <span>${transfer.status === 'success' ? '✅' : '⚠️'}</span>
      </div>
      <div class="transfer-meta">
        <span>${transfer.source}</span>
        <span>${transfer.destination}</span>
      </div>
      <small>Finished ${safeDate(transfer.finishedAt)}</small>
      <div class="transfer-actions">
        ${transfer.status === 'failed' ? '<button class="small-button" data-action="retry-transfer" data-transfer-id="' + transfer.id + '">Retry</button>' : ''}
      </div>
    </div>
  `).join('');
}

function renderSettings() {
  const container = document.getElementById('settingsContainer');
  const settings = appState.settings;

  const sections = `
    <div class="settings-block">
      <header><h3>Appearance</h3><button class="small-button" data-action="restore-defaults">Restore Defaults</button></header>
      <div class="settings-grid">
        <div class="setting-row"><label>Dark Mode</label><input type="checkbox" data-setting="darkMode" ${settings.darkMode ? 'checked' : ''} /></div>
        <div class="setting-row"><label>Text Size</label><input type="range" min="14" max="22" value="${settings.textSize}" data-setting="textSize" /></div>
        <div class="setting-row"><label>Background Color</label><input type="color" value="${settings.backgroundColor}" data-setting="backgroundColor" /></div>
        <div class="setting-row"><label>Show Icons</label><input type="checkbox" data-setting="showIcons" ${settings.showIcons ? 'checked' : ''} /></div>
      </div>
    </div>

    <div class="settings-block">
      <header><h3>Notifications & Alerts</h3></header>
      <div class="settings-grid">
        <div class="setting-row"><label>Play sound</label><input type="checkbox" data-setting="soundAlerts" ${settings.soundAlerts ? 'checked' : ''} /></div>
        <div class="setting-row"><label>Browser notifications</label><input type="checkbox" data-setting="browserNotifications" ${settings.browserNotifications ? 'checked' : ''} /></div>
        <div class="setting-row"><label>Notification type</label><select data-setting="notificationType"><option value="soft-beep" ${settings.notificationType === 'soft-beep' ? 'selected' : ''}>Soft Beep</option><option value="desktop" ${settings.notificationType === 'desktop' ? 'selected' : ''}>Desktop Notification</option></select></div>
        <div class="setting-row"><label>Auto scan</label><input type="checkbox" data-setting="autoScan" ${settings.autoScan ? 'checked' : ''} /></div>
      </div>
    </div>

    <div class="settings-block">
      <header><h3>Data Management</h3></header>
      <div class="form-actions">
        <button class="primary-button" data-action="export-data">Export All Data</button>
        <label class="secondary-button" style="display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;">
          <input type="file" id="importBackupInput" class="hidden" data-action="import-data" />
          Import Backup
        </label>
        <button class="secondary-button" data-action="reset-settings">Reset All Settings</button>
      </div>
    </div>

    <div class="settings-block">
      <header><h3>Accessibility</h3></header>
      <div class="settings-grid">
        <div class="setting-row"><label>High contrast mode</label><input type="checkbox" data-setting="highContrast" ${settings.highContrast ? 'checked' : ''} /></div>
        <div class="setting-row"><label>Reduce motion</label><input type="checkbox" data-setting="reduceMotion" ${settings.reduceMotion ? 'checked' : ''} /></div>
        <div class="setting-row"><label>Tooltips enabled</label><input type="checkbox" data-setting="tooltips" ${settings.tooltips ? 'checked' : ''} /></div>
      </div>
    </div>

    <div class="settings-block">
      <header><h3>System</h3></header>
      <div class="settings-grid">
        <div class="setting-row"><label>System name</label><strong>Red Robin's Access System</strong></div>
        <div class="setting-row"><label>Version</label><strong>1.0.0</strong></div>
        <div class="setting-row"><label>Storage Usage</label><strong>${estimateStorage()} MB</strong></div>
        <div class="setting-row"><label>Browser</label><strong>${navigator.userAgent.split(' ').slice(0, 3).join(' ')}</strong></div>
      </div>
      <div class="form-actions">
        <button class="danger-button" data-action="delete-account">Permanently Delete Account</button>
      </div>
    </div>

    <div class="settings-block">
      <header><h3>Legal</h3></header>
      <div class="settings-grid">
        <div class="setting-row"><a href="#" class="inline-terms-link" data-action="open-terms" data-return-page="settingsPage">Terms and Conditions</a></div>
      </div>
    </div>
  `;

  container.innerHTML = sections;
}

function estimateStorage() {
  try {
    const raw = JSON.stringify(localStorage).length;
    return Math.max(1, Math.round(raw / 1024));
  } catch (err) {
    return 12;
  }
}

function renderAbout() {
  // This section is static in the page.
}

function renderEverything() {
  renderDashboard();
  renderNetwork();
  renderBluetooth();
  renderThreats();
  renderDevices();
  renderTransfers();
  renderSettings();
  if (appState.account) {
    showMainApp();
    setPage(appState.page || 'dashboardPage');
  } else {
    showAuthView();
  }
}

function scheduleNetworkRefresh() {
  clearInterval(refreshTimer);
  const intervalMap = { manual: null, 5: 5000, 10: 10000, 30: 30000, 60: 60000, 300: 300000 };
  const next = intervalMap[appState.network.refreshInterval || 'manual'];
  if (next) {
    refreshTimer = setInterval(() => simulateNetworkRefresh(), next);
  }
}

function simulateNetworkRefresh() {
  const signal = Math.max(45, Math.min(96, Math.round(Math.random() * 50 + 45)));
  const down = Math.round(Math.random() * 200 + 110);
  const up = Math.round(Math.random() * 80 + 20);
  const now = new Date();
  appState.network.status = 'Connected';
  appState.network.ip = `192.168.1.${Math.floor(Math.random() * 90 + 10)}`;
  appState.network.signal = signal;
  appState.network.connectionType = signal > 75 ? 'Wi‑Fi 6' : 'Wi‑Fi 5';
  appState.network.speedTest = { down, up };
  appState.network.lastUpdated = now.toISOString();
  appState.network.log.unshift({
    time: now.toISOString(),
    event: 'Network refresh completed',
    value: `Download ${down} Mb/s — Upload ${up} Mb/s`,
  });
  saveState();
  renderNetwork();
}

function updateBluetoothScan() {
  appState.bluetooth.scanning = !appState.bluetooth.scanning;
  appState.bluetooth.lastScanTime = new Date().toISOString();
  if (appState.bluetooth.scanning) {
    appState.bluetooth.history.unshift({
      time: new Date().toISOString(),
      event: 'Bluetooth scan started',
      detail: 'Scanning for nearby devices',
    });
    const deviceNames = ['Desk Dock', 'Printer', 'Office Mouse', 'Smart TV', 'Laptop Charger'];
    const newDevices = deviceNames.map((name, index) => ({
      id: Date.now() + index,
      name,
      type: 'Peripheral',
      signal: Math.round(Math.random() * 60 + 35),
      status: 'Nearby',
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      ignored: false,
    }));
    appState.bluetooth.devices = [...newDevices, ...appState.bluetooth.devices].slice(0, 6);
    showToast('Scanning for devices...');
  } else {
    appState.bluetooth.history.unshift({
      time: new Date().toISOString(),
      event: 'Bluetooth scan paused',
      detail: 'Scanning is paused',
    });
  }
  saveState();
  renderBluetooth();
}

function generateAlert() {
  const titles = [
    'Unexpected device detected',
    'Unusual backup activity',
    'Slightly elevated network activity',
    'Device check completed',
  ];
  const details = [
    'A new nearby device was identified during the last Bluetooth scan.',
    'A process completed outside your normal activity window.',
    'A network event was flagged for review. Nothing is blocked, but it should be checked.',
    'The system completed a routine check and recorded no high-risk behavior.',
  ];
  const severities = ['Warning', 'Caution', 'Information'];
  const next = {
    id: alertSequence++,
    time: new Date().toISOString(),
    title: titles[Math.floor(Math.random() * titles.length)],
    detail: details[Math.floor(Math.random() * details.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    reviewed: false,
    dismissed: false,
  };
  appState.alerts.unshift(next);
  saveState();
  renderThreats();
}

function pauseAlertsFor(duration) {
  const message = duration === 'manual' ? 'Alerts paused until manually resumed.' : `Alerts paused for ${duration}.`;
  showToast(message);
}

function exportData() {
  const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'red-robin-backup.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exported successfully');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      appState = mergeState(parsed);
      saveState();
      renderEverything();
      showToast('Backup restored successfully');
    } catch (err) {
      showToast('This backup could not be imported.');
    }
  };
  reader.readAsText(file);
}

function updateSetting(target) {
  const key = target.dataset.setting;
  if (!key) return;
  const value = target.type === 'checkbox' ? target.checked : target.value;
  appState.settings[key] = value;
  if (key === 'darkMode') document.body.style.background = value ? '#1d1d1f' : '#f3ead8';
  if (key === 'textSize') document.documentElement.style.fontSize = `${Number(value)}px`;
  if (key === 'backgroundColor') document.body.style.background = value;
  saveState();
  renderSettings();
}

function restoreDefaults() {
  appState.settings = { ...DEFAULT_SETTINGS };
  saveState();
  renderSettings();
  showToast('Settings restored to defaults');
}

function deleteAccount() {
  const confirmDelete = window.confirm('Are you sure? This permanently deletes your account and data from this browser storage.');
  if (!confirmDelete) return;
  localStorage.removeItem(STORAGE_KEY);
  appState = loadState();
  showAuthView();
  showAuthArea('registerView');
  document.getElementById('registerForm').reset();
  showToast('Account deleted');
}

function showForgotPinModal() {
  const question = appState.account?.securityQuestion || 'Your security question';
  const answer = window.prompt(`Answer your security question: ${question}`);
  if (answer === null) return;
  if (answer.trim().toLowerCase() !== appState.account.securityAnswer) {
    showToast('That answer is not correct — please try again or ask for help.');
    return;
  }

  const newPin = window.prompt('Choose a new PIN (4 to 6 digits):');
  if (newPin === null) return;
  if (!isDigitPin(newPin)) {
    showToast('PIN must be 4 to 6 digits.');
    return;
  }
  appState.account.pin = newPin.trim();
  saveState();
  showToast('PIN updated successfully.');
}

function changePinFlow() {
  const currentPin = window.prompt('Enter your current PIN to confirm your identity:');
  if (currentPin === null) return;
  if (currentPin.trim() !== appState.account.pin) {
    showToast('The current PIN is incorrect.');
    return;
  }

  const newPin = window.prompt('Enter your new PIN (4 to 6 digits):');
  if (newPin === null) return;
  const confirmPin = window.prompt('Confirm your new PIN:');
  if (confirmPin === null) return;

  if (!isDigitPin(newPin) || newPin.trim() !== confirmPin.trim()) {
    showToast('PINs do not match or the PIN is invalid.');
    return;
  }

  appState.account.pin = newPin.trim();
  saveState();
  showToast('PIN changed successfully.');
}

function updateTransferProgress() {
  if (!appState.transfers.active.length) return;
  appState.transfers.active = appState.transfers.active.map((transfer) => {
    const nextProgress = Math.min(100, transfer.progress + (Math.random() * 12 + 6));
    const done = nextProgress >= 100;
    if (done) {
      appState.transfers.history.unshift({
        id: Date.now() + Math.random(),
        name: transfer.name,
        source: transfer.source,
        destination: transfer.destination,
        size: transfer.size,
        finishedAt: new Date().toISOString(),
        status: 'success',
      });
      return null;
    }
    return {
      ...transfer,
      progress: Math.round(nextProgress),
      speed: `${(Math.random() * 6 + 1).toFixed(1)} MB/s`,
      remaining: `${Math.max(0, Math.ceil((100 - nextProgress) / 5))}:00`,
    };
  }).filter(Boolean);
  saveState();
  renderTransfers();
}

function bindEvents() {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => showAuthArea(button.dataset.view));
  });

  document.getElementById('registerForm').addEventListener('input', updateCreateAccountState);
  document.getElementById('termsCheckbox').addEventListener('change', updateCreateAccountState);
  document.getElementById('registerForm').addEventListener('submit', registerAccount);
  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    attemptLogin();
  });

  document.getElementById('togglePinVisibility').addEventListener('click', () => {
    const visible = document.getElementById('loginPin').type === 'password';
    setLoginPinVisibility(visible);
  });

  document.getElementById('forgotPinBtn').addEventListener('click', () => {
    if (!appState.account) {
      showToast('There is no active account yet. Please create one first.');
      return;
    }
    showForgotPinModal();
  });

  document.getElementById('logoutBtn').addEventListener('click', () => logoutUser('You have been logged out due to inactivity — please enter your PIN to continue.'));

  document.querySelectorAll('.nav-button').forEach((button) => {
    button.addEventListener('click', () => setPage(button.dataset.page));
  });

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      if (page) setPage(page);
    });
  });

  document.getElementById('refreshNetworkBtn').addEventListener('click', simulateNetworkRefresh);
  document.getElementById('copyNetworkBtn').addEventListener('click', async () => {
    const text = [
      `Status: ${appState.network.status}`,
      `Public IP: ${appState.network.ip}`,
      `Signal strength: ${appState.network.signal}%`,
      `Connection type: ${appState.network.connectionType}`,
      `Download speed: ${appState.network.speedTest.down} Mb/s`,
      `Upload speed: ${appState.network.speedTest.up} Mb/s`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard successfully');
    } catch (error) {
      showToast('Clipboard access is unavailable in this browser.');
    }
  });

  document.getElementById('refreshIntervalSelect').addEventListener('change', (event) => {
    appState.network.refreshInterval = event.target.value;
    saveState();
    scheduleNetworkRefresh();
  });

  document.getElementById('bluetoothMasterToggle').addEventListener('change', updateBluetoothScan);
  document.getElementById('scanBluetoothBtn').addEventListener('click', updateBluetoothScan);

  document.getElementById('pauseAlertsBtn').addEventListener('click', () => {
    const pauseChoice = window.prompt('Pause alerts for 15 minutes, 30 minutes, 1 hour, or until manually resumed.');
    if (!pauseChoice) return;
    pauseAlertsFor(pauseChoice.trim() || 'manual');
  });

  document.getElementById('clearAlertsBtn').addEventListener('click', () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete ALL alert history? This cannot be undone.');
    if (!confirmed) return;
    appState.alerts = [];
    appState.archive = [];
    saveState();
    renderThreats();
    showToast('Alert history cleared');
  });

  document.getElementById('clearTransfersBtn').addEventListener('click', () => {
    const confirmed = window.confirm('Clear all transfer history? This does NOT delete the actual files from your computer — only removes them from this list.');
    if (!confirmed) return;
    appState.transfers.history = [];
    saveState();
    renderTransfers();
  });

  document.getElementById('fileSearch').addEventListener('input', (event) => {
    appState.devices.searchTerm = event.target.value;
    renderDevices();
  });

  document.getElementById('fileSortSelect').addEventListener('change', (event) => {
    appState.devices.sortMode = event.target.value;
    renderDevices();
  });

  document.getElementById('fileBackBtn').addEventListener('click', () => {
    const history = appState.devices.folderHistory || ['/'];
    if (appState.devices.folderIndex > 0) {
      appState.devices.folderIndex -= 1;
    }
    renderDevices();
  });

  document.getElementById('fileForwardBtn').addEventListener('click', () => {
    const history = appState.devices.folderHistory || ['/'];
    if (appState.devices.folderIndex < history.length - 1) {
      appState.devices.folderIndex += 1;
    }
    renderDevices();
  });

  document.getElementById('fileUpBtn').addEventListener('click', () => {
    appState.devices.currentFolder = '/';
    renderDevices();
  });

  document.getElementById('fileHomeBtn').addEventListener('click', () => {
    appState.devices.selectedDeviceId = 'drive-1';
    renderDevices();
  });

  document.addEventListener('click', (event) => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    event.preventDefault();
    const action = control.dataset.action;

    if (action === 'open-terms') {
      const target = control.dataset.returnPage || 'registerView';
      openTermsModal(target);
      return;
    }

    if (action === 'close-terms') {
      closeTermsModal();
      return;
    }

    if (action === 'select-device') {
      appState.devices.selectedDeviceId = control.dataset.deviceId;
      appState.devices.selectedFileId = null;
      renderDevices();
      return;
    }

    if (action === 'toggle-ignore') {
      const device = appState.bluetooth.devices.find((item) => item.id === Number(control.dataset.deviceId));
      if (device) device.ignored = !device.ignored;
      saveState();
      renderBluetooth();
      return;
    }

    if (action === 'review-alert') {
      const alert = appState.alerts.find((item) => item.id === Number(control.dataset.alertId));
      if (alert) alert.reviewed = true;
      saveState();
      renderThreats();
      return;
    }

    if (action === 'dismiss-alert') {
      const alert = appState.alerts.find((item) => item.id === Number(control.dataset.alertId));
      if (alert) {
        alert.dismissed = true;
        appState.archive.push({ ...alert, reviewed: true, dismissed: true });
        appState.alerts = appState.alerts.filter((item) => item.id !== alert.id);
      }
      saveState();
      renderThreats();
      return;
    }

    if (action === 'investigate-alert') {
      const alert = appState.alerts.find((item) => item.id === Number(control.dataset.alertId));
      if (alert) showToast(`${alert.title}: ${alert.detail}`);
      return;
    }

    if (action === 'select-file') {
      appState.devices.selectedFileId = control.dataset.fileId;
      renderDevices();
      return;
    }

    if (action === 'preview-file') {
      const file = findCurrentFileById(control.dataset.fileId);
      if (file) showToast(`Previewing ${file.name}`);
      return;
    }

    if (action === 'copy-to-computer') {
      const file = findCurrentFileById(control.dataset.fileId);
      if (file) showToast(`Copied ${file.name} to My Computer`);
      return;
    }

    if (action === 'copy-to-device') {
      const file = findCurrentFileById(control.dataset.fileId);
      if (file) showToast(`Copied ${file.name} to device`);
      return;
    }

    if (action === 'rename-file') {
      const file = findCurrentFileById(control.dataset.fileId);
      if (!file) return;
      const name = window.prompt('Rename file:', file.name);
      if (name) {
        file.name = name.trim();
        saveState();
        renderDevices();
      }
      return;
    }

    if (action === 'delete-file') {
      const file = findCurrentFileById(control.dataset.fileId);
      if (!file) return;
      const confirmed = window.confirm('Are you sure you want to delete this file? It may not be recoverable.');
      if (!confirmed) return;
      const device = getSelectedDevice();
      device.files = device.files.filter((entry) => entry.id !== file.id);
      saveState();
      renderDevices();
      return;
    }

    if (action === 'eject-device') {
      const deviceId = control.dataset.deviceId;
      const device = appState.devices.devices.find((entry) => entry.id === deviceId);
      if (device) {
        showToast(`Safe to remove — you can now unplug your device. (${device.name})`);
      }
      return;
    }

    if (action === 'pause-transfer') {
      const transfer = appState.transfers.active.find((entry) => entry.id === Number(control.dataset.transferId));
      if (transfer) transfer.status = 'paused';
      saveState();
      renderTransfers();
      return;
    }

    if (action === 'resume-transfer') {
      const transfer = appState.transfers.active.find((entry) => entry.id === Number(control.dataset.transferId));
      if (transfer) transfer.status = 'active';
      saveState();
      renderTransfers();
      return;
    }

    if (action === 'cancel-transfer') {
      const transferId = Number(control.dataset.transferId);
      appState.transfers.active = appState.transfers.active.filter((entry) => entry.id !== transferId);
      appState.transfers.history.unshift({
        id: Date.now(),
        name: 'Cancelled transfer',
        source: 'System',
        destination: 'Cancelled',
        size: '—',
        finishedAt: new Date().toISOString(),
        status: 'failed',
      });
      saveState();
      renderTransfers();
      return;
    }

    if (action === 'retry-transfer') {
      showToast('Retrying transfer from the beginning.');
      return;
    }

    if (action === 'restore-defaults') {
      restoreDefaults();
      return;
    }

    if (action === 'export-data') {
      exportData();
      return;
    }

    if (action === 'reset-settings') {
      restoreDefaults();
      return;
    }

    if (action === 'import-data') {
      const input = document.getElementById('importBackupInput');
      if (input) input.click();
      return;
    }

    if (action === 'delete-account') {
      deleteAccount();
      return;
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target && target.id === 'importBackupInput') {
      const file = target.files[0];
      importData(file);
      target.value = '';
      return;
    }
    if (target.matches('[data-setting]')) {
      updateSetting(target);
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (event.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;

    if (key === 'd') setPage('dashboardPage');
    if (key === 'n') setPage('networkPage');
    if (key === 'b') setPage('bluetoothPage');
    if (key === 'f') setPage('devicesPage');
    if (key === 's') setPage('settingsPage');
    if (key === 'l') logoutUser('You have been logged out due to inactivity — please enter your PIN to continue.');
  });

  document.addEventListener('pointerdown', trackInteraction, { passive: true });
  document.addEventListener('keydown', trackInteraction);
}

function findCurrentFileById(fileId) {
  const device = getSelectedDevice();
  return device?.files.find((file) => file.id === fileId) || null;
}

function getSelectedDevice() {
  return appState.devices.devices.find((device) => device.id === appState.devices.selectedDeviceId) || appState.devices.devices[0];
}

function initialize() {
  const loginPin = document.getElementById('loginPin');
  const registerForm = document.getElementById('registerForm');
  if (loginPin) loginPin.value = '';
  if (registerForm) registerForm.reset();
  bindEvents();
  renderEverything();
  scheduleNetworkRefresh();
  setInterval(() => {
    if (appState.account) {
      if (appState.bluetooth.scanning) renderBluetooth();
      if (appState.transfers.active.length) updateTransferProgress();
    }
  }, 4000);
  setInterval(() => {
    if (appState.account && Math.random() > 0.55) generateAlert();
  }, 20000);
  setInterval(() => {
    const lockUntil = Number(appState.auth.lastBlockedUntil || 0);
    const loginError = document.getElementById('loginError');
    if (lockUntil > Date.now()) {
      const remaining = Math.ceil((lockUntil - Date.now()) / 1000);
      if (loginError) {
        loginError.textContent = `Too many attempts — please wait ${remaining} seconds before trying again.`;
        loginError.classList.remove('hidden');
      }
    }
  }, 1000);
  if (appState.account) {
    showMainApp();
  } else {
    showAuthView();
  }
}

initialize();
