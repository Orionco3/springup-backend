const roles = require('./roles');

const permissions = [
    {
        key: 'user',
        permissions: ['view-company-users-listing', 'view-company-user-details', 'view-company-department-details'],
    },
    {
        key: 'portfolio',
        permissions: ['view-portfolio-listing', 'view-portfolio-details'],
    },
    {
        key: 'goal',
        permissions: ['view-all-goals-listing', 'view-goal-details', 'create-new-goal'],
    },
    {
        key: 'task',
        permissions: ['view-app-data-listing'],
    },
    {
        key: 'reward',
        permissions: ['view-rewards-listing'],
    },
    {
        key: 'report',
        permissions: ['view-reports'],
    },
    // {
    //     key: 'appIntegration',
    //     permissions: ['view-app-integration-settings', 'view-gusto-callback-settings', 'view-asana-callback-integration', 'view-ringcentral-callback-integration', 'view-deputy-callback-integration'],
    // },
    {
        key: 'departmentConfiguration',
        permissions: ['view-department-configurations-settings'],
    },
    {
        key: 'employeeData',
        permissions: ['view-employees-data-settings'],
    },
    {
        key: 'companyProfile',
        permissions: ['view-company-profile-settings'],
    },
    {
        key: 'messages',
        permissions: ['view-notification-settings'],
    },
    {
        key: 'customize',
        permissions: ['view-customize-settings'],
    },
];

async function setRole(user) {
    let accessControlInfo = {};
    if (user.role !== '304') {
        Object.keys(roles).some((role) => {
            const userRoleFound = user.role === roles[role].key;
            if (userRoleFound) {
                accessControlInfo = roles[role];
            }
            return userRoleFound;
        });
    }
    return accessControlInfo;
}
module.exports = { permissions, setRole };
