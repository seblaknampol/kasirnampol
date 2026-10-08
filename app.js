'use strict';

/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
  'https://frmtdmngzyowfzijjqog.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_3kLizOd7Mb-P5en0I_0TMA_gkWF37u4';

const KASIR_URL =
  'https://seblaknampol.github.io/kasirnampol/';

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   ELEMENT
   ========================================================= */

const authScreen =
  document.getElementById(
    'auth-screen'
  );

const appScreen =
  document.getElementById(
    'app-screen'
  );

const loginForm =
  document.getElementById(
    'login-form'
  );

const forgotForm =
  document.getElementById(
    'forgot-form'
  );

const updatePasswordForm =
  document.getElementById(
    'update-password-form'
  );

const loginEmail =
  document.getElementById(
    'login-email'
  );

const loginPassword =
  document.getElementById(
    'login-password'
  );

const forgotEmail =
  document.getElementById(
    'forgot-email'
  );

const newPassword =
  document.getElementById(
    'new-password'
  );

const confirmPassword =
  document.getElementById(
    'confirm-password'
  );

const loginMessage =
  document.getElementById(
    'login-message'
  );

const forgotMessage =
  document.getElementById(
    'forgot-message'
  );

const updatePasswordMessage =
  document.getElementById(
    'update-password-message'
  );

const cashierName =
  document.getElementById(
    'cashier-name'
  );

const logoutBtn =
  document.getElementById(
    'logout-btn'
  );

const forgotPasswordBtn =
  document.getElementById(
    'forgot-password-btn'
  );

const backLoginBtn =
  document.getElementById(
    'back-login-btn'
  );


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(
  element,
  message,
  type = ''
) {

  if (!element) {
    return;
  }

  element.textContent =
    message || '';

  element.className =
    'auth-message';

  if (type) {
    element.classList.add(type);
  }
}


/* =========================================================
   AUTH FORMS
   ========================================================= */

function hideAllAuthForms() {

  loginForm?.classList.add(
    'hidden'
  );

  forgotForm?.classList.add(
    'hidden'
  );

  updatePasswordForm?.classList.add(
    'hidden'
  );
}


function showLogin() {

  hideAllAuthForms();

  loginForm?.classList.remove(
    'hidden'
  );

  showMessage(
    forgotMessage,
    ''
  );

  showMessage(
    updatePasswordMessage,
    ''
  );
}


function showForgotPassword() {

  hideAllAuthForms();

  forgotForm?.classList.remove(
    'hidden'
  );

  showMessage(
    loginMessage,
    ''
  );

  forgotEmail.value =
    loginEmail.value || '';
}


function showUpdatePassword() {

  hideAllAuthForms();

  updatePasswordForm?.classList.remove(
    'hidden'
  );

  showMessage(
    loginMessage,
    ''
  );

  showMessage(
    forgotMessage,
    ''
  );

  showMessage(
    updatePasswordMessage,
    ''
  );
}


/* =========================================================
   APP SCREEN
   ========================================================= */

function showApp() {

  authScreen?.classList.add(
    'hidden'
  );

  appScreen?.classList.remove(
    'hidden'
  );
}


function showAuth() {

  appScreen?.classList.add(
    'hidden'
  );

  authScreen?.classList.remove(
    'hidden'
  );
}


/* =========================================================
   CASHIER PROFILE
   ========================================================= */

async function loadCashierProfile(
  user
) {

  if (!user) {
    return false;
  }

  const {
    data,
    error
  } =
    await supabaseClient
      .from('profiles')
      .select(
        'id, full_name, role, status'
      )
      .eq(
        'id',
        user.id
      )
      .maybeSingle();

  if (error) {

    console.error(
      'Gagal mengambil profil Kasir:',
      error
    );

    return false;
  }

  if (!data) {

    await supabaseClient.auth.signOut();

    showAuth();

    showLogin();

    showMessage(
      loginMessage,
      'Profil Kasir tidak ditemukan.',
      'error'
    );

    return false;
  }

  if (
    data.role !==
    'cashier'
  ) {

    await supabaseClient.auth.signOut();

    showAuth();

    showLogin();

    showMessage(
      loginMessage,
      'Akun ini bukan akun Kasir.',
      'error'
    );

    return false;
  }

  if (
    data.status !==
    'active'
  ) {

    await supabaseClient.auth.signOut();

    showAuth();

    showLogin();

    showMessage(
      loginMessage,
      'Akun Kasir sedang tidak aktif.',
      'error'
    );

    return false;
  }

  if (cashierName) {

    cashierName.textContent =
      data.full_name ||
      user.email ||
      'Kasir';
  }

  return true;
}


/* =========================================================
   LOGIN
   ========================================================= */

loginForm?.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();

    showMessage(
      loginMessage,
      ''
    );

    const email =
      loginEmail.value
        .trim()
        .toLowerCase();

    const password =
      loginPassword.value;

    if (
      !email ||
      !password
    ) {

      showMessage(
        loginMessage,
        'Email dan password wajib diisi.',
        'error'
      );

      return;
    }

    const submitButton =
      loginForm.querySelector(
        'button[type="submit"]'
      );

    submitButton.disabled =
      true;

    submitButton.textContent =
      'Memproses...';

    const {
      data,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({
          email,
          password
        });

    submitButton.disabled =
      false;

    submitButton.textContent =
      'Masuk';

    if (error) {

      console.error(
        'Login error:',
        error
      );

      showMessage(
        loginMessage,
        error.message ||
          'Login gagal.',
        'error'
      );

      return;
    }

    const valid =
      await loadCashierProfile(
        data.user
      );

    if (!valid) {
      return;
    }

    showApp();
  }
);


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

forgotForm?.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();

    showMessage(
      forgotMessage,
      ''
    );

    const email =
      forgotEmail.value
        .trim()
        .toLowerCase();

    if (!email) {

      showMessage(
        forgotMessage,
        'Email wajib diisi.',
        'error'
      );

      return;
    }

    const submitButton =
      forgotForm.querySelector(
        'button[type="submit"]'
      );

    submitButton.disabled =
      true;

    submitButton.textContent =
      'Mengirim...';

    const {
      error
    } =
      await supabaseClient.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              KASIR_URL
          }
        );

    submitButton.disabled =
      false;

    submitButton.textContent =
      'Kirim Link Reset';

    if (error) {

      console.error(
        'Reset password error:',
        error
      );

      showMessage(
        forgotMessage,
        error.message ||
          'Gagal mengirim link reset password.',
        'error'
      );

      return;
    }

    showMessage(
      forgotMessage,
      'Link reset password telah dikirim ke email.',
      'success'
    );
  }
);


/* =========================================================
   UPDATE PASSWORD
   ========================================================= */

updatePasswordForm?.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();

    showMessage(
      updatePasswordMessage,
      ''
    );

    const password =
      newPassword.value;

    const confirmation =
      confirmPassword.value;

    if (
      !password ||
      !confirmation
    ) {

      showMessage(
        updatePasswordMessage,
        'Password wajib diisi.',
        'error'
      );

      return;
    }

    if (
      password.length < 6
    ) {

      showMessage(
        updatePasswordMessage,
        'Password minimal 6 karakter.',
        'error'
      );

      return;
    }

    if (
      password !== confirmation
    ) {

      showMessage(
        updatePasswordMessage,
        'Konfirmasi password tidak sama.',
        'error'
      );

      return;
    }

    const submitButton =
      updatePasswordForm.querySelector(
        'button[type="submit"]'
      );

    submitButton.disabled =
      true;

    submitButton.textContent =
      'Menyimpan...';

    const {
      error
    } =
      await supabaseClient.auth
        .updateUser({
          password
        });

    submitButton.disabled =
      false;

    submitButton.textContent =
      'Simpan Password';

    if (error) {

      console.error(
        'Update password error:',
        error
      );

      showMessage(
        updatePasswordMessage,
        error.message ||
          'Gagal menyimpan password.',
        'error'
      );

      return;
    }

    showMessage(
      updatePasswordMessage,
      'Password berhasil dibuat. Silakan masuk dengan password baru.',
      'success'
    );

    newPassword.value =
      '';

    confirmPassword.value =
      '';

    setTimeout(
      async () => {

        await supabaseClient.auth
          .signOut();

        showAuth();

        showLogin();

        loginEmail.value =
          '';

        loginPassword.value =
          '';

      },
      1200
    );
  }
);


/* =========================================================
   BUTTONS
   ========================================================= */

forgotPasswordBtn?.addEventListener(
  'click',
  showForgotPassword
);

backLoginBtn?.addEventListener(
  'click',
  showLogin
);


/* =========================================================
   LOGOUT
   ========================================================= */

logoutBtn?.addEventListener(
  'click',
  async () => {

    logoutBtn.disabled =
      true;

    await supabaseClient.auth
      .signOut();

    logoutBtn.disabled =
      false;

    loginPassword.value =
      '';

    showAuth();

    showLogin();
  }
);


/* =========================================================
   PASSWORD RECOVERY / INVITATION
   ========================================================= */

let recoveryDetected =
  false;

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    console.log(
      'Auth event:',
      event
    );

    /*
     * Link reset password akan
     * menghasilkan event PASSWORD_RECOVERY.
     */
    if (
      event ===
      'PASSWORD_RECOVERY'
    ) {

      recoveryDetected =
        true;

      showAuth();

      showUpdatePassword();

      return;
    }

    if (
      event ===
      'SIGNED_OUT'
    ) {

      if (!recoveryDetected) {
        showAuth();
        showLogin();
      }

      return;
    }

    /*
     * Login normal.
     */
    if (
      event ===
        'SIGNED_IN' &&
      session?.user
    ) {

      /*
       * Jangan langsung masuk
       * aplikasi apabila sedang
       * dalam proses recovery.
       */
      if (recoveryDetected) {
        return;
      }

      const valid =
        await loadCashierProfile(
          session.user
        );

      if (valid) {
        showApp();
      }
    }
  }
);


/* =========================================================
   CHECK SESSION
   ========================================================= */

async function checkSession() {

  const {
    data,
    error
  } =
    await supabaseClient.auth
      .getSession();

  if (error) {

    console.error(
      'Session error:',
      error
    );

    showAuth();

    showLogin();

    return;
  }

  const session =
    data?.session;

  if (!session?.user) {

    showAuth();

    showLogin();

    return;
  }

  /*
   * Jika event recovery sudah
   * terdeteksi, jangan masuk
   * dashboard.
   */
  if (recoveryDetected) {
    return;
  }

  const valid =
    await loadCashierProfile(
      session.user
    );

  if (valid) {
    showApp();
  }
}


/* =========================================================
   START
   ========================================================= */

checkSession();
