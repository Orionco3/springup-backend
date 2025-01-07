const roles = {
  superAdmin: {
    key: '300',
    value: 'Super Admin',
    permissions: [
      // DASHBOARD
      'view-dashboard',

      // COMPANIES
      'view-admin-job-listing',
      'view-admin-resume-listing',
      'view-admin-user-listing',
      'view-admin-paid-user-listing',



      // Payment Permotion
      'view-admin-set-permotion',

      // SETTINGS
      'view-app-account-settings',
    ],
  },
  // Company Admin
  candidate: {
    key: '301',
    value: 'Candidate',
    permissions: [
      // DASHBOARD
      'view-dashboard',

      // USERS CREATE User Profile
      'view-create-profile',
      'view-user-profile',

      'view-manage-interview',

      // SETTINGS
      'view-app-account-settings',

      'manage-account-billings',

      'request-consultation'
    ],
  },

  employer: {
    key: '302',
    value: 'Employer',
    permissions: [
      // DASHBOARD
      'view-dashboard',

      // Job Management
      'view-company-creation',
      'view-company-view',

      // Job Management
      'view-job-creation',
      'view-job-listing',
      'view-job-detail',

      // SETTINGS
      'view-app-account-settings',
    ],
  },
};

module.exports = roles;
