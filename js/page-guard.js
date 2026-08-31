/**
 * KRISHISHETRA — PAGE GUARD
 * Prevents unauthorized access to protected dashboard pages,
 * redirects guests to login.html, and ensures users only access
 * dashboards matching their authenticated role.
 */

(function () {
  'use strict';

  function checkPageAccess() {
    if (!window.Auth) {
      console.error('[PageGuard] Auth module not loaded.');
      return;
    }

    const body = document.body;
    const metaRole = document.querySelector('meta[name="required-role"]');
    const requiredRole = (metaRole ? metaRole.getAttribute('content') : '') || (body ? body.getAttribute('data-require-role') : '') || '';
    const isProtected = (metaRole !== null) || (body && (body.hasAttribute('data-protected') || body.hasAttribute('data-require-role')));

    if (isProtected) {
      if (!window.Auth.requireAuth()) {
        return;
      }

      if (requiredRole) {
        window.Auth.requireRole(requiredRole);
      }
    }
  }

  // Run as early as DOM is ready or immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkPageAccess);
  } else {
    checkPageAccess();
  }

  // Export global PageGuard helper
  window.PageGuard = {
    protect: (options = {}) => {
      if (!window.Auth) return false;
      if (!window.Auth.requireAuth()) return false;
      if (options.role) {
        return window.Auth.requireRole(options.role);
      }
      return true;
    }
  };
})();
