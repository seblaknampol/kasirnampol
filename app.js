'use strict';

/* =========================================================
   KASIR NAMPOL
   APP
   ========================================================= */

const SUPABASE_URL =
  'https://frmtdmngzyowfzijjqog.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_3kLizOd7Mb-P5en0I_0TMA_gkWF37u4';


/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


/* =========================================================
   DOM
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

const loginMessage =
  document.getElementById(
    'login-message'
  );

const forgotMessage =
  document.getElementById(
    'forgot-message'
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
   HELPERS
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


function showLogin() {
  loginForm.classList.remove(
    'hidden'
  );

  forgotForm.classList.add(
    'hidden'
  );

  showMessage(
    forgotMessage,
    ''
  );
}


function showForgotPassword() {
  loginForm.classList.add(
    'hidden'
  );

  forgotForm.classList.remove(
    'hidden'
  );

  showMessage(
    loginMessage,
    ''
  );

  forgotEmail.value =
    loginEmail.value || '';
}


function showApp() {
  authScreen.classList.add(
    'hidden'
  );

  appScreen.classList.remove(
    'hidden'
  );
}


function showAuth() {
  appScreen.classList.add(
    'hidden'
  );

  authScreen.classList.remove(
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
    return;
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

    return;
  }

  if (!data) {
    await supabaseClient.auth.signOut();

    showAuth();

    showMessage(
      loginMessage,
      'Profil Kasir tidak ditemukan.',
      'error'
    );

    return;
  }

  if (
    data.role !== 'cashier'
  ) {
    await supabaseClient.auth.signOut();

    showAuth();

    showMessage(
      loginMessage,
      'Akun ini bukan akun Kasir.',
      'error'
    );

    return;
  }

  if (
    data.status !== 'active'
  ) {
    await supabaseClient.auth.signOut();

    showAuth();

    showMessage(
      loginMessage,
      'Akun Kasir sedang tidak aktif.',
      'error'
    );

    return;
  }

  cashierName.textContent =
    data.full_name ||
    user.email ||
    'Kasir';
}


/* =========================================================
   LOGIN
   ========================================================= */

loginForm.addEventListener(
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

    await loadCashierProfile(
      data.user
    );

    const {
      data: sessionData
    } =
      await supabaseClient.auth
        .getSession();

    if (
      sessionData?.session
    ) {
      showApp();
    }
  }
);


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

forgotForm.addEventListener(
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
              'https://seblaknampol.github.io/kasirnampol/'
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
   NAVIGATION AUTH
   ========================================================= */

forgotPasswordBtn.addEventListener(
  'click',
  showForgotPassword
);

backLoginBtn.addEventListener(
  'click',
  showLogin
);


/* =========================================================
   LOGOUT
   ========================================================= */

logoutBtn.addEventListener(
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
  }
);


/* =========================================================
   SESSION CHECK
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

    return;
  }

  const session =
    data?.session;

  if (!session?.user) {
    showAuth();

    return;
  }

  await loadCashierProfile(
    session.user
  );

  const {
    data: verified
  } =
    await supabaseClient.auth
      .getSession();

  if (
    verified?.session
  ) {
    showApp();
  }
}


/* =========================================================
   AUTH STATE
   ========================================================= */

supabaseClient.auth.onAuthStateChange(
  async (
    event,
    session
  ) => {

    if (
      event === 'SIGNED_OUT'
    ) {
      showAuth();

      return;
    }

    if (
      session?.user
    ) {
      await loadCashierProfile(
        session.user
      );

      showApp();
    }
  }
);


/* =========================================================
   START
   ========================================================= */

checkSession();
