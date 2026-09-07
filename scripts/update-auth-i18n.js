const fs = require('fs');
const path = require('path');

// 1. UPDATE LOGIN.HTML
function updateLoginHtml() {
  const filePath = path.join(__dirname, '..', 'login.html');
  let content = fs.readFileSync(filePath, 'utf8');

  const scriptRegex = /<script>\s*document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/;
  if (!scriptRegex.test(content)) {
    console.error('Could not find DOMContentLoaded script regex in login.html');
    return;
  }

  const newScript = `<script>
    document.addEventListener('DOMContentLoaded', () => {
      // Helper for localized string retrieval
      const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : (f || k);

      // Elements
      const tabsContainer = document.getElementById('auth-tabs-container');
      const tabBtnLogin = document.getElementById('tab-btn-login');
      const tabBtnRegister = document.getElementById('tab-btn-register');
      const loginForm = document.getElementById('auth-login-form');
      const registerForm = document.getElementById('auth-register-form');
      const forgotForm = document.getElementById('auth-forgot-form');
      const resetPassForm = document.getElementById('auth-reset-pass-form');
      const otpStepContainer = document.getElementById('otp-step-container');

      // Header elements
      const authTitle = document.getElementById('auth-title');
      const authSubtitle = document.getElementById('auth-subtitle');

      // Login elements
      const loginEmail = document.getElementById('login-email');
      const loginPassword = document.getElementById('login-password');
      const btnLogin = document.getElementById('btn-login');
      const loginAlert = document.getElementById('login-alert');
      const linkToRegister = document.getElementById('link-to-register');
      const linkToForgot = document.getElementById('link-to-forgot');

      // Register elements
      const registerName = document.getElementById('register-name');
      const registerEmail = document.getElementById('register-email');
      const registerPhone = document.getElementById('register-phone');
      const registerPassword = document.getElementById('register-password');
      const btnRegister = document.getElementById('btn-register');
      const registerAlert = document.getElementById('register-alert');
      const linkToLogin = document.getElementById('link-to-login');
      const roleCards = document.querySelectorAll('.auth-role-card');

      // Forgot & Reset elements
      const forgotEmail = document.getElementById('forgot-email');
      const btnForgotSubmit = document.getElementById('btn-forgot-submit');
      const forgotAlert = document.getElementById('forgot-alert');
      const linkForgotToLogin = document.getElementById('link-forgot-to-login');

      const resetNewPassword = document.getElementById('reset-new-password');
      const btnResetPassSubmit = document.getElementById('btn-reset-pass-submit');
      const resetPassAlert = document.getElementById('reset-pass-alert');
      const linkResetToLogin = document.getElementById('link-reset-to-login');

      // OTP elements
      const displayUserEmail = document.getElementById('display-user-email');
      const btnChangeEmail = document.getElementById('btn-change-email');
      const otpBoxes = Array.from(document.querySelectorAll('.auth-otp-box'));
      const otpAlert = document.getElementById('otp-alert');
      const btnVerifyOtp = document.getElementById('btn-verify-otp');
      const timerCount = document.getElementById('timer-count');
      const btnResendOtp = document.getElementById('btn-resend-otp');
      const otpTimerDisplay = document.getElementById('otp-timer-display');
      const linkBackToLogin = document.getElementById('link-back-to-login');

      let currentRole = 'farmer';
      let countdown = 60;
      let timerInterval = null;
      let activeOtpEmail = '';
      let isResetFlow = false;
      let activeResetToken = '';
      let currentView = 'login'; // 'login' | 'register' | 'forgot' | 'reset' | 'otp'

      // ── UI Alert Helpers ──
      function showAlert(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.className = \`auth-alert auth-alert--\${type}\`;
        element.style.display = 'block';
      }

      function showStructuredAlert(element, { title, message, actionText, actionCallback, type = 'warning' }) {
        if (!element) return;
        element.className = \`auth-alert auth-alert--\${type}\`;
        element.innerHTML = \`
          <div class="auth-alert-content">
            <div class="auth-alert-title">
              <i data-lucide="\${type === 'warning' ? 'alert-triangle' : 'alert-circle'}" style="width:14px;height:14px;"></i>
              <span>\${title}</span>
            </div>
            <div class="auth-alert-msg">\${message}</div>
            \${actionText ? \`<button type="button" class="auth-alert-action-btn" id="alert-action-btn">\${actionText}</button>\` : ''}
          </div>
        \`;
        element.style.display = 'block';
        if (window.lucide) lucide.createIcons();

        if (actionText && typeof actionCallback === 'function') {
          const btn = element.querySelector('#alert-action-btn');
          if (btn) btn.addEventListener('click', actionCallback);
        }
      }

      function hideAlert(element) {
        if (!element) return;
        element.style.display = 'none';
        element.textContent = '';
      }

      // ── Password Visibility Toggle ──
      document.querySelectorAll('.auth-toggle-pass-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.target;
          const input = document.getElementById(targetId);
          if (input) {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = \`<i data-lucide="\${isPass ? 'eye-off' : 'eye'}" style="width:16px;height:16px;"></i>\`;
            if (window.lucide) lucide.createIcons();
          }
        });
      });

      // ── Tab & View Switchers with Reactive i18n ──
      function showLoginTab() {
        currentView = 'login';
        isResetFlow = false;
        tabsContainer.style.display = 'flex';
        tabBtnLogin.classList.add('active');
        tabBtnRegister.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        forgotForm.style.display = 'none';
        resetPassForm.style.display = 'none';
        otpStepContainer.classList.remove('active');

        authTitle.setAttribute('data-i18n', 'auth.welcomeBack');
        authTitle.textContent = t('auth.welcomeBack', 'Welcome Back');
        authSubtitle.setAttribute('data-i18n', 'auth.loginSubtitle');
        authSubtitle.textContent = t('auth.loginSubtitle', 'Enter your credentials to access your account');
        hideAlert(loginAlert);
      }

      function showRegisterTab() {
        currentView = 'register';
        isResetFlow = false;
        tabsContainer.style.display = 'flex';
        tabBtnRegister.classList.add('active');
        tabBtnLogin.classList.remove('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        forgotForm.style.display = 'none';
        resetPassForm.style.display = 'none';
        otpStepContainer.classList.remove('active');

        authTitle.setAttribute('data-i18n', 'auth.registerTitle');
        authTitle.textContent = t('auth.registerTitle', 'Create KrishiShetra Account');
        authSubtitle.setAttribute('data-i18n', 'auth.registerSubtitle');
        authSubtitle.textContent = t('auth.registerSubtitle', 'Join India\\'s trusted digital agriculture trade network');
        hideAlert(registerAlert);
      }

      function showForgotTab() {
        currentView = 'forgot';
        isResetFlow = true;
        tabsContainer.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        forgotForm.style.display = 'block';
        resetPassForm.style.display = 'none';
        otpStepContainer.classList.remove('active');

        authTitle.setAttribute('data-i18n', 'auth.forgotPassword');
        authTitle.textContent = t('auth.forgotPassword', 'Forgot Password?');
        authSubtitle.setAttribute('data-i18n', 'auth.sendResetOtp');
        authSubtitle.textContent = t('auth.sendResetOtp', 'Send Reset OTP to your registered email');
        hideAlert(forgotAlert);
        if (loginEmail && loginEmail.value.trim()) {
          forgotEmail.value = loginEmail.value.trim();
        }
      }

      function showResetPassStep() {
        currentView = 'reset';
        tabsContainer.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        forgotForm.style.display = 'none';
        resetPassForm.style.display = 'block';
        otpStepContainer.classList.remove('active');

        authTitle.setAttribute('data-i18n', 'auth.resetPassword');
        authTitle.textContent = t('auth.resetPassword', 'Reset Password');
        authSubtitle.setAttribute('data-i18n', 'auth.newPassword');
        authSubtitle.textContent = t('auth.newPassword', 'Create a new secure password for your account');
        hideAlert(resetPassAlert);
        resetNewPassword.value = '';
        resetNewPassword.focus();
      }

      function showOtpStep(email, forReset = false) {
        currentView = 'otp';
        isResetFlow = forReset;
        activeOtpEmail = email;
        displayUserEmail.textContent = email;
        tabsContainer.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        forgotForm.style.display = 'none';
        resetPassForm.style.display = 'none';
        otpStepContainer.classList.add('active');

        authTitle.setAttribute('data-i18n', 'auth.enterOtp');
        authTitle.textContent = t('auth.enterOtp', 'Enter 6-Digit Verification OTP');
        authSubtitle.setAttribute('data-i18n', 'auth.otpSentTo');
        authSubtitle.textContent = t('auth.otpSentTo', 'Verification code sent to email inbox');

        hideAlert(otpAlert);
        startResendTimer();
        otpBoxes.forEach(b => b.value = '');
        if (otpBoxes[0]) otpBoxes[0].focus();
      }

      function updateActiveViewTranslations() {
        if (currentView === 'login') showLoginTab();
        else if (currentView === 'register') showRegisterTab();
        else if (currentView === 'forgot') showForgotTab();
        else if (currentView === 'reset') showResetPassStep();
        else if (currentView === 'otp') showOtpStep(activeOtpEmail, isResetFlow);
      }

      // ── Language Change Listener ──
      window.addEventListener('languageChanged', () => {
        if (window.i18next && typeof window.i18next.translatePage === 'function') {
          window.i18next.translatePage();
        }
        updateActiveViewTranslations();
      });

      tabBtnLogin.addEventListener('click', showLoginTab);
      tabBtnRegister.addEventListener('click', showRegisterTab);
      linkToRegister.addEventListener('click', showRegisterTab);
      linkToLogin.addEventListener('click', showLoginTab);
      linkBackToLogin.addEventListener('click', showLoginTab);
      linkToForgot.addEventListener('click', showForgotTab);
      linkForgotToLogin.addEventListener('click', showLoginTab);
      linkResetToLogin.addEventListener('click', showLoginTab);
      btnChangeEmail.addEventListener('click', () => {
        if (isResetFlow) showForgotTab();
        else showRegisterTab();
      });

      // ── Role Selector ──
      roleCards.forEach(card => {
        card.addEventListener('click', () => {
          roleCards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('active');
          card.setAttribute('aria-checked', 'true');
          currentRole = card.dataset.role;
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            card.click();
          }
        });
      });

      // Phone Input Formatting
      registerPhone.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\\D/g, '');
        if (val.length > 10) val = val.slice(0, 10);
        e.target.value = val;
      });

      // ── Timer Handler (60s Cooldown) ──
      function startResendTimer() {
        countdown = 60;
        btnResendOtp.disabled = true;
        otpTimerDisplay.style.display = 'inline';
        timerCount.textContent = countdown;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          countdown--;
          timerCount.textContent = countdown;
          if (countdown <= 0) {
            clearInterval(timerInterval);
            otpTimerDisplay.style.display = 'none';
            btnResendOtp.disabled = false;
          }
        }, 1000);
      }

      // ── 6-Box OTP Input Handling ──
      otpBoxes.forEach((box, idx) => {
        box.addEventListener('input', (e) => {
          const val = e.target.value.replace(/\\D/g, '');
          e.target.value = val ? val[val.length - 1] : '';
          hideAlert(otpAlert);

          if (e.target.value && idx < otpBoxes.length - 1) {
            otpBoxes[idx + 1].focus();
          }
        });

        box.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !box.value && idx > 0) {
            otpBoxes[idx - 1].focus();
          }
        });

        box.addEventListener('paste', (e) => {
          e.preventDefault();
          const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\\D/g, '').slice(0, 6);
          if (pasted.length > 0) {
            pasted.split('').forEach((char, i) => {
              if (otpBoxes[i]) otpBoxes[i].value = char;
            });
            const nextFocus = Math.min(pasted.length, 5);
            otpBoxes[nextFocus].focus();
          }
        });
      });

      function getEnteredOtp() {
        return otpBoxes.map(b => b.value).join('');
      }

      const isLocal = window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const API_BASE = (window.API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : 'https://krishishetra-1.onrender.com/api')).replace(/\\/+$/, '');

      // ── 1. LOGIN API HANDLER ──
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(loginAlert);

        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {
          showAlert(loginAlert, t('validation.requiredField', 'Please fill in all required fields.'));
          return;
        }

        btnLogin.disabled = true;
        btnLogin.innerHTML = \`\${t('common.loading', 'Signing in…')} <span class="auth-btn-arrow">⏳</span>\`;

        try {
          const res = await fetch(\`\${API_BASE}/auth/login\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            window.Auth.setToken(data.token);
            window.Auth.setUser(data.user);

            btnLogin.innerHTML = \`\${t('auth.loginSuccess', 'Login Successful!')} ✓\`;
            btnLogin.style.background = '#5B9A72';

            setTimeout(() => {
              const userRole = (data.user && data.user.role) ? data.user.role.toLowerCase() : 'farmer';
              if (userRole === 'buyer') {
                window.location.href = 'buyer.html';
              } else if (userRole === 'fpo') {
                window.location.href = 'fpo-dashboard.html';
              } else if (userRole === 'transporter') {
                window.location.href = 'transporter/dashboard.html';
              } else if (userRole === 'admin') {
                window.location.href = 'admin/dashboard.html';
              } else {
                window.location.href = 'dashboard.html';
              }
            }, 600);
          } else {
            btnLogin.disabled = false;
            btnLogin.innerHTML = \`<span id="btn-login-text">\${t('auth.logIn', 'Log In')}</span> <span class="auth-btn-arrow">→</span>\`;
            showAlert(loginAlert, data.message || t('errors.unauthorized', 'Invalid email or password.'));

            if (data.message && data.message.includes('verify your email')) {
              activeOtpEmail = email;
              setTimeout(() => {
                showOtpStep(email, false);
                showAlert(otpAlert, t('auth.registrationSuccess', 'Please enter your verification OTP to activate your account.'));
              }, 1200);
            }
          }
        } catch (err) {
          console.error('[Login Network Error]:', err);
          btnLogin.disabled = false;
          btnLogin.innerHTML = \`<span id="btn-login-text">\${t('auth.logIn', 'Log In')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(loginAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── 2. REGISTER API HANDLER ──
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(registerAlert);

        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const phone = registerPhone.value.trim();
        const password = registerPassword.value;

        if (!name || !email || !password) {
          showAlert(registerAlert, t('validation.requiredField', 'Please fill in all required fields.'));
          return;
        }

        if (password.length < 6) {
          showAlert(registerAlert, t('validation.passwordMinLength', 'Password must be at least 6 characters long.'));
          return;
        }

        btnRegister.disabled = true;
        btnRegister.innerHTML = \`\${t('common.loading', 'Sending OTP…')} <span class="auth-btn-arrow">⏳</span>\`;

        try {
          const res = await fetch(\`\${API_BASE}/auth/register\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone,
              password,
              role: currentRole
            })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            btnRegister.disabled = false;
            btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
            
            showOtpStep(email, false);
            showAlert(otpAlert, data.message || t('auth.registrationSuccess', 'Registration successful. Check your email for OTP.'), 'success');
          } else if (data.message && (data.message.includes('verification email could not be sent') || data.message.includes('Resend OTP'))) {
            btnRegister.disabled = false;
            btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
            
            showStructuredAlert(registerAlert, {
              title: t('errors.actionFailed', 'Verification email not sent'),
              message: t('auth.registrationSuccess', "Account created, but verification email could not be sent. You can request a new OTP."),
              actionText: \`\${t('auth.resendCode', 'Resend OTP')} ↻\`,
              actionCallback: async () => {
                showOtpStep(email, false);
                showAlert(otpAlert, t('common.loading', 'Requesting a new verification code…'));
                try {
                  const resendRes = await fetch(\`\${API_BASE}/auth/resend-verification\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });
                  const resendData = await resendRes.json();
                  if (resendRes.ok && resendData.success) {
                    showAlert(otpAlert, resendData.message || t('auth.registrationSuccess', 'A new verification OTP has been sent.'), 'success');
                  } else {
                    showAlert(otpAlert, resendData.message || t('errors.serverError', 'Could not send OTP. Please try again.'));
                  }
                } catch (rErr) {
                  showAlert(otpAlert, t('errors.networkError', 'Unable to connect to server to resend OTP.'));
                }
              },
              type: 'warning'
            });
          } else {
            btnRegister.disabled = false;
            btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
            showAlert(registerAlert, data.message || t('errors.actionFailed', 'Registration failed. Please try again.'));
          }
        } catch (err) {
          console.error('[Register Network Error]:', err);
          btnRegister.disabled = false;
          btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(registerAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── 3. FORGOT PASSWORD API HANDLER ──
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(forgotAlert);

        const email = forgotEmail.value.trim();
        if (!email) {
          showAlert(forgotAlert, t('validation.invalidEmail', 'Please enter your email address.'));
          return;
        }

        btnForgotSubmit.disabled = true;
        btnForgotSubmit.innerHTML = \`\${t('common.loading', 'Sending Recovery OTP…')} <span class="auth-btn-arrow">⏳</span>\`;

        try {
          const res = await fetch(\`\${API_BASE}/auth/forgot-password\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          btnForgotSubmit.disabled = false;
          btnForgotSubmit.innerHTML = \`<span id="btn-forgot-text">\${t('auth.sendResetOtp', 'Send Reset OTP')}</span> <span class="auth-btn-arrow">→</span>\`;

          if (res.ok && data.success) {
            showOtpStep(email, true);
            showAlert(otpAlert, data.message || t('auth.registrationSuccess', 'If an account exists, a reset OTP has been sent to your inbox.'), 'success');
          } else {
            showAlert(forgotAlert, data.message || t('errors.actionFailed', 'Failed to process password reset.'));
          }
        } catch (err) {
          console.error('[Forgot Password Network Error]:', err);
          btnForgotSubmit.disabled = false;
          btnForgotSubmit.innerHTML = \`<span id="btn-forgot-text">\${t('auth.sendResetOtp', 'Send Reset OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(forgotAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── 4. VERIFY OTP API HANDLER ──
      btnVerifyOtp.addEventListener('click', async () => {
        hideAlert(otpAlert);
        const otp = getEnteredOtp();

        if (otp.length < 6) {
          showAlert(otpAlert, t('validation.invalidOtp', 'Please enter all 6 digits.'));
          return;
        }

        btnVerifyOtp.disabled = true;
        btnVerifyOtp.innerHTML = \`\${t('common.loading', 'Verifying…')} <span class="auth-btn-arrow">⏳</span>\`;

        const endpoint = isResetFlow ? '/auth/verify-reset-otp' : '/auth/verify-email';

        try {
          const res = await fetch(\`\${API_BASE}\${endpoint}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: activeOtpEmail,
              otp: otp
            })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            btnVerifyOtp.innerHTML = \`\${t('common.completed', 'Verified!')} ✓\`;
            btnVerifyOtp.style.background = '#5B9A72';

            if (isResetFlow) {
              activeResetToken = data.resetToken;
              setTimeout(() => {
                btnVerifyOtp.disabled = false;
                btnVerifyOtp.style.background = '';
                btnVerifyOtp.innerHTML = \`<span id="btn-verify-text">\${t('auth.verifyAndContinue', 'Verify & Continue')}</span> <span class="auth-btn-arrow">→</span>\`;
                showResetPassStep();
              }, 800);
            } else {
              showAlert(otpAlert, t('auth.otpVerified', 'Email verified successfully! Redirecting to login…'), 'success');

              setTimeout(() => {
                btnVerifyOtp.disabled = false;
                btnVerifyOtp.style.background = '';
                btnVerifyOtp.innerHTML = \`<span id="btn-verify-text">\${t('auth.verifyAndContinue', 'Verify & Continue')}</span> <span class="auth-btn-arrow">→</span>\`;
                
                showLoginTab();
                loginEmail.value = activeOtpEmail;
                showAlert(loginAlert, t('auth.otpVerified', 'Email verified successfully. Please log in with your password.'), 'success');
              }, 1200);
            }
          } else {
            btnVerifyOtp.disabled = false;
            btnVerifyOtp.innerHTML = \`<span id="btn-verify-text">\${t('auth.verifyAndContinue', 'Verify & Continue')}</span> <span class="auth-btn-arrow">→</span>\`;
            showAlert(otpAlert, data.message || t('validation.invalidOtp', 'Invalid or expired OTP.'));
          }
        } catch (err) {
          console.error('[Verify OTP Network Error]:', err);
          btnVerifyOtp.disabled = false;
          btnVerifyOtp.innerHTML = \`<span id="btn-verify-text">\${t('auth.verifyAndContinue', 'Verify & Continue')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(otpAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── 5. SET NEW PASSWORD HANDLER ──
      resetPassForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(resetPassAlert);

        const newPassword = resetNewPassword.value;
        if (!newPassword || newPassword.length < 6) {
          showAlert(resetPassAlert, t('validation.passwordMinLength', 'Password must be at least 6 characters long.'));
          return;
        }

        btnResetPassSubmit.disabled = true;
        btnResetPassSubmit.innerHTML = \`\${t('common.loading', 'Resetting Password…')} <span class="auth-btn-arrow">⏳</span>\`;

        try {
          const res = await fetch(\`\${API_BASE}/auth/reset-password\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resetToken: activeResetToken,
              newPassword
            })
          });

          const data = await res.json();

          if (res.ok && data.success) {
            btnResetPassSubmit.innerHTML = \`\${t('common.completed', 'Password Reset!')} ✓\`;
            btnResetPassSubmit.style.background = '#5B9A72';

            showAlert(resetPassAlert, t('auth.passwordResetSuccess', 'Password reset successfully! Redirecting to login…'), 'success');

            setTimeout(() => {
              btnResetPassSubmit.disabled = false;
              btnResetPassSubmit.style.background = '';
              btnResetPassSubmit.innerHTML = \`<span id="btn-reset-text">\${t('auth.resetPassword', 'Reset Password')}</span> <span class="auth-btn-arrow">→</span>\`;
              
              showLoginTab();
              loginEmail.value = activeOtpEmail;
              showAlert(loginAlert, t('auth.passwordResetSuccess', 'Password reset successfully. Please log in with your new password.'), 'success');
            }, 1200);
          } else {
            btnResetPassSubmit.disabled = false;
            btnResetPassSubmit.innerHTML = \`<span id="btn-reset-text">\${t('auth.resetPassword', 'Reset Password')}</span> <span class="auth-btn-arrow">→</span>\`;
            showAlert(resetPassAlert, data.message || t('errors.actionFailed', 'Failed to reset password.'));
          }
        } catch (err) {
          btnResetPassSubmit.disabled = false;
          btnResetPassSubmit.innerHTML = \`<span id="btn-reset-text">\${t('auth.resetPassword', 'Reset Password')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(resetPassAlert, t('errors.networkError', 'Network error. Please check your backend connection.'));
        }
      });

      // ── 6. RESEND OTP API HANDLER ──
      btnResendOtp.addEventListener('click', async () => {
        hideAlert(otpAlert);
        btnResendOtp.disabled = true;
        btnResendOtp.textContent = t('common.loading', 'Sending…');

        const endpoint = isResetFlow ? '/auth/resend-reset-otp' : '/auth/resend-verification';

        try {
          const res = await fetch(\`\${API_BASE}\${endpoint}\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: activeOtpEmail })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            btnResendOtp.textContent = t('auth.resendCode', 'Resend Code');
            showAlert(otpAlert, data.message || t('auth.registrationSuccess', 'A new verification OTP has been sent.'), 'success');
            startResendTimer();
          } else {
            btnResendOtp.disabled = false;
            btnResendOtp.textContent = t('auth.resendCode', 'Resend Code');
            showAlert(otpAlert, data.message || t('errors.actionFailed', 'Failed to resend OTP.'));
          }
        } catch (err) {
          console.error('[Resend OTP Network Error]:', err);
          btnResendOtp.disabled = false;
          btnResendOtp.textContent = t('auth.resendCode', 'Resend Code');
          showAlert(otpAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── Local Development Role Shortcut Handler ──
      const isDevEnv = (window.Auth && typeof window.Auth.isLocalEnv === 'function' && window.Auth.isLocalEnv()) ||
                       window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.protocol === 'file:';

      if (isDevEnv) {
        const devBlock = document.getElementById('local-dev-testing');
        if (devBlock) {
          devBlock.style.display = 'block';
          devBlock.querySelectorAll('.dev-role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              const role = (btn.getAttribute('data-dev-role') || 'farmer').toLowerCase();
              
              if (window.Auth && typeof window.Auth.setDevSession === 'function') {
                window.Auth.setDevSession(role);
              } else {
                const devUser = {
                  id: \`dev_\${role}_id\`,
                  role: role,
                  name: \`Development \${role.charAt(0).toUpperCase() + role.slice(1)}\`,
                  email: \`dev.\${role}@krishishetra.local\`,
                  isDev: true
                };
                localStorage.setItem('krishishetra_dev_session', JSON.stringify(devUser));
                localStorage.setItem('krishi_user', JSON.stringify(devUser));
                localStorage.setItem('krishi_user_role', role);
                localStorage.setItem('krishi_is_logged_in', 'true');
              }

              // Explicit Direct Canonical Routing
              switch (role) {
                case 'buyer':
                  window.location.href = '/buyer.html';
                  break;
                case 'fpo':
                  window.location.href = '/fpo-dashboard.html';
                  break;
                case 'transporter':
                  window.location.href = '/transporter/dashboard.html';
                  break;
                case 'admin':
                  window.location.href = '/admin/dashboard.html';
                  break;
                case 'farmer':
                default:
                  window.location.href = '/dashboard.html';
                  break;
              }
            });
          });
        }
      }

      if (window.lucide) lucide.createIcons();
    });
  </script>`;

  content = content.replace(scriptRegex, newScript);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated login.html with full reactive i18n logic.');
}

// 2. UPDATE REGISTER.HTML
function updateRegisterHtml() {
  const filePath = path.join(__dirname, '..', 'register.html');
  let content = fs.readFileSync(filePath, 'utf8');

  const scriptRegex = /<script>\s*document\.addEventListener\('DOMContentLoaded'[\s\S]*?<\/script>/;
  if (!scriptRegex.test(content)) {
    console.error('Could not find DOMContentLoaded script regex in register.html');
    return;
  }

  const newScript = `<script>
    document.addEventListener('DOMContentLoaded', () => {
      // Helper for localized string retrieval
      const t = (k, f) => (window.i18next && typeof window.i18next.t === 'function') ? window.i18next.t(k, f) : (f || k);

      // Elements
      const tabsContainer = document.getElementById('auth-tabs-container');
      const registerForm = document.getElementById('auth-register-form');
      const otpStepContainer = document.getElementById('otp-step-container');

      // Header elements
      const authTitle = document.getElementById('auth-title');
      const authSubtitle = document.getElementById('auth-subtitle');

      // Register elements
      const registerName = document.getElementById('register-name');
      const registerEmail = document.getElementById('register-email');
      const registerPhone = document.getElementById('register-phone');
      const registerPassword = document.getElementById('register-password');
      const btnRegister = document.getElementById('btn-register');
      const registerAlert = document.getElementById('register-alert');
      const roleCards = document.querySelectorAll('.auth-role-card');

      // OTP elements
      const displayUserEmail = document.getElementById('display-user-email');
      const btnChangeEmail = document.getElementById('btn-change-email');
      const otpBoxes = Array.from(document.querySelectorAll('.auth-otp-box'));
      const otpAlert = document.getElementById('otp-alert');
      const btnVerifyOtp = document.getElementById('btn-verify-otp');
      const timerCount = document.getElementById('timer-count');
      const btnResendOtp = document.getElementById('btn-resend-otp');
      const otpTimerDisplay = document.getElementById('otp-timer-display');

      let currentRole = 'farmer';
      let countdown = 60;
      let timerInterval = null;
      let activeOtpEmail = '';
      let isOtpView = false;

      // ── UI Alert Helpers ──
      function showAlert(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.className = \`auth-alert auth-alert--\${type}\`;
        element.style.display = 'block';
      }

      function showStructuredAlert(element, { title, message, actionText, actionCallback, type = 'warning' }) {
        if (!element) return;
        element.className = \`auth-alert auth-alert--\${type}\`;
        element.innerHTML = \`
          <div class="auth-alert-content">
            <div class="auth-alert-title">
              <i data-lucide="\${type === 'warning' ? 'alert-triangle' : 'alert-circle'}" style="width:14px;height:14px;"></i>
              <span>\${title}</span>
            </div>
            <div class="auth-alert-msg">\${message}</div>
            \${actionText ? \`<button type="button" class="auth-alert-action-btn" id="alert-action-btn">\${actionText}</button>\` : ''}
          </div>
        \`;
        element.style.display = 'block';
        if (window.lucide) lucide.createIcons();

        if (actionText && typeof actionCallback === 'function') {
          const btn = element.querySelector('#alert-action-btn');
          if (btn) btn.addEventListener('click', actionCallback);
        }
      }

      function hideAlert(element) {
        if (!element) return;
        element.style.display = 'none';
        element.textContent = '';
      }

      // ── Password Visibility Toggle ──
      document.querySelectorAll('.auth-toggle-pass-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.target;
          const input = document.getElementById(targetId);
          if (input) {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = \`<i data-lucide="\${isPass ? 'eye-off' : 'eye'}" style="width:16px;height:16px;"></i>\`;
            if (window.lucide) lucide.createIcons();
          }
        });
      });

      function showRegisterForm() {
        isOtpView = false;
        tabsContainer.style.display = 'flex';
        registerForm.style.display = 'block';
        otpStepContainer.classList.remove('active');

        authTitle.setAttribute('data-i18n', 'auth.registerTitle');
        authTitle.textContent = t('auth.registerTitle', 'Create KrishiShetra Account');
        authSubtitle.setAttribute('data-i18n', 'auth.registerSubtitle');
        authSubtitle.textContent = t('auth.registerSubtitle', 'Join India\\'s trusted digital agriculture trade network');
        hideAlert(registerAlert);
      }

      function showOtpStep(email) {
        isOtpView = true;
        activeOtpEmail = email;
        displayUserEmail.textContent = email;
        tabsContainer.style.display = 'none';
        registerForm.style.display = 'none';
        otpStepContainer.classList.add('active');

        authTitle.setAttribute('data-i18n', 'auth.enterOtp');
        authTitle.textContent = t('auth.enterOtp', 'Enter 6-Digit Verification OTP');
        authSubtitle.setAttribute('data-i18n', 'auth.otpSentTo');
        authSubtitle.textContent = t('auth.otpSentTo', 'Verification code sent to email inbox');

        hideAlert(otpAlert);
        startResendTimer();
        otpBoxes.forEach(b => b.value = '');
        if (otpBoxes[0]) otpBoxes[0].focus();
      }

      // ── Language Change Listener ──
      window.addEventListener('languageChanged', () => {
        if (window.i18next && typeof window.i18next.translatePage === 'function') {
          window.i18next.translatePage();
        }
        if (isOtpView) {
          showOtpStep(activeOtpEmail);
        } else {
          showRegisterForm();
        }
      });

      btnChangeEmail.addEventListener('click', showRegisterForm);

      // ── Role Selector ──
      roleCards.forEach(card => {
        card.addEventListener('click', () => {
          roleCards.forEach(c => {
            c.classList.remove('active');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('active');
          card.setAttribute('aria-checked', 'true');
          currentRole = card.dataset.role;
        });

        card.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            card.click();
          }
        });
      });

      // Phone Input Formatting
      registerPhone.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\\D/g, '');
        if (val.length > 10) val = val.slice(0, 10);
        e.target.value = val;
      });

      // ── Timer Handler (60s Cooldown) ──
      function startResendTimer() {
        countdown = 60;
        btnResendOtp.disabled = true;
        otpTimerDisplay.style.display = 'inline';
        timerCount.textContent = countdown;
        
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          countdown--;
          timerCount.textContent = countdown;
          if (countdown <= 0) {
            clearInterval(timerInterval);
            otpTimerDisplay.style.display = 'none';
            btnResendOtp.disabled = false;
          }
        }, 1000);
      }

      // ── 6-Box OTP Input Handling ──
      otpBoxes.forEach((box, idx) => {
        box.addEventListener('input', (e) => {
          const val = e.target.value.replace(/\\D/g, '');
          e.target.value = val ? val[val.length - 1] : '';
          hideAlert(otpAlert);

          if (e.target.value && idx < otpBoxes.length - 1) {
            otpBoxes[idx + 1].focus();
          }
        });

        box.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !box.value && idx > 0) {
            otpBoxes[idx - 1].focus();
          }
        });

        box.addEventListener('paste', (e) => {
          e.preventDefault();
          const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\\D/g, '').slice(0, 6);
          if (pasted.length > 0) {
            pasted.split('').forEach((char, i) => {
              if (otpBoxes[i]) otpBoxes[i].value = char;
            });
            const nextFocus = Math.min(pasted.length, 5);
            otpBoxes[nextFocus].focus();
          }
        });
      });

      function getEnteredOtp() {
        return otpBoxes.map(b => b.value).join('');
      }

      const isLocal = window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      const API_BASE = (window.API_BASE_URL || (isLocal ? 'http://localhost:5000/api' : 'https://krishishetra-1.onrender.com/api')).replace(/\\/+$/, '');

      // ── REGISTER API HANDLER ──
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert(registerAlert);

        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const phone = registerPhone.value.trim();
        const password = registerPassword.value;

        if (!name || !email || !password) {
          showAlert(registerAlert, t('validation.requiredField', 'Please fill in all required fields.'));
          return;
        }

        if (password.length < 6) {
          showAlert(registerAlert, t('validation.passwordMinLength', 'Password must be at least 6 characters long.'));
          return;
        }

        btnRegister.disabled = true;
        btnRegister.innerHTML = \`\${t('common.loading', 'Sending OTP…')} <span class="auth-btn-arrow">⏳</span>\`;

        try {
          const res = await fetch(\`\${API_BASE}/auth/register\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone,
              password,
              role: currentRole
            })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            btnRegister.disabled = false;
            btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
            
            showOtpStep(email);
            showAlert(otpAlert, data.message || t('auth.registrationSuccess', 'Registration successful. Check your email for OTP.'), 'success');
          } else if (data.message && (data.message.includes('verification email could not be sent') || data.message.includes('Resend OTP'))) {
            btnRegister.disabled = false;
            btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
            
            showStructuredAlert(registerAlert, {
              title: t('errors.actionFailed', 'Verification email not sent'),
              message: t('auth.registrationSuccess', "Account created, but verification email could not be sent. You can request a new OTP."),
              actionText: \`\${t('auth.resendCode', 'Resend OTP')} ↻\`,
              actionCallback: async () => {
                showOtpStep(email);
                showAlert(otpAlert, t('common.loading', 'Requesting a new verification code…'));
                try {
                  const resendRes = await fetch(\`\${API_BASE}/auth/resend-verification\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                  });
                  const resendData = await resendRes.json();
                  if (resendRes.ok && resendData.success) {
                    showAlert(otpAlert, resendData.message || t('auth.registrationSuccess', 'A new verification OTP has been sent.'), 'success');
                  } else {
                    showAlert(otpAlert, resendData.message || t('errors.serverError', 'Could not send OTP. Please try again.'));
                  }
                } catch (rErr) {
                  showAlert(otpAlert, t('errors.networkError', 'Unable to connect to server to resend OTP.'));
                }
              },
              type: 'warning'
            });
          } else {
            btnRegister.disabled = false;
            btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
            showAlert(registerAlert, data.message || t('errors.actionFailed', 'Registration failed. Please try again.'));
          }
        } catch (err) {
          console.error('[Register Network Error]:', err);
          btnRegister.disabled = false;
          btnRegister.innerHTML = \`<span id="btn-register-text">\${t('auth.registerTitle', 'Register & Send OTP')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(registerAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── VERIFY OTP API HANDLER ──
      btnVerifyOtp.addEventListener('click', async () => {
        hideAlert(otpAlert);
        const otp = getEnteredOtp();

        if (otp.length < 6) {
          showAlert(otpAlert, t('validation.invalidOtp', 'Please enter all 6 digits.'));
          return;
        }

        btnVerifyOtp.disabled = true;
        btnVerifyOtp.innerHTML = \`\${t('common.loading', 'Verifying…')} <span class="auth-btn-arrow">⏳</span>\`;

        try {
          const res = await fetch(\`\${API_BASE}/auth/verify-email\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: activeOtpEmail,
              otp: otp
            })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            btnVerifyOtp.innerHTML = \`\${t('common.completed', 'Verified!')} ✓\`;
            btnVerifyOtp.style.background = '#5B9A72';

            showAlert(otpAlert, t('auth.otpVerified', 'Email verified successfully! Redirecting to login…'), 'success');

            setTimeout(() => {
              window.location.href = \`login.html?verified=true&email=\${encodeURIComponent(activeOtpEmail)}\`;
            }, 1200);
          } else {
            btnVerifyOtp.disabled = false;
            btnVerifyOtp.innerHTML = \`<span id="btn-verify-text">\${t('auth.verifyAndContinue', 'Verify & Continue')}</span> <span class="auth-btn-arrow">→</span>\`;
            showAlert(otpAlert, data.message || t('validation.invalidOtp', 'Invalid or expired OTP.'));
          }
        } catch (err) {
          console.error('[Verify OTP Network Error]:', err);
          btnVerifyOtp.disabled = false;
          btnVerifyOtp.innerHTML = \`<span id="btn-verify-text">\${t('auth.verifyAndContinue', 'Verify & Continue')}</span> <span class="auth-btn-arrow">→</span>\`;
          showAlert(otpAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      // ── RESEND OTP API HANDLER ──
      btnResendOtp.addEventListener('click', async () => {
        hideAlert(otpAlert);
        btnResendOtp.disabled = true;
        btnResendOtp.textContent = t('common.loading', 'Sending…');

        try {
          const res = await fetch(\`\${API_BASE}/auth/resend-verification\`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: activeOtpEmail })
          });

          let data;
          try {
            data = await res.json();
          } catch (pe) {
            data = { success: res.ok, message: 'Invalid response from server' };
          }

          if (res.ok && data.success) {
            btnResendOtp.textContent = t('auth.resendCode', 'Resend Code');
            showAlert(otpAlert, data.message || t('auth.registrationSuccess', 'A new verification OTP has been sent.'), 'success');
            startResendTimer();
          } else {
            btnResendOtp.disabled = false;
            btnResendOtp.textContent = t('auth.resendCode', 'Resend Code');
            showAlert(otpAlert, data.message || t('errors.actionFailed', 'Failed to resend OTP.'));
          }
        } catch (err) {
          console.error('[Resend OTP Network Error]:', err);
          btnResendOtp.disabled = false;
          btnResendOtp.textContent = t('auth.resendCode', 'Resend Code');
          showAlert(otpAlert, t('errors.networkError', 'Unable to connect to KrishiShetra server. Check your network.'));
        }
      });

      if (window.lucide) lucide.createIcons();
    });
  </script>`;

  content = content.replace(scriptRegex, newScript);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated register.html with full reactive i18n logic.');
}

updateLoginHtml();
updateRegisterHtml();
