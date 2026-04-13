// helpers/permissions.js
export const ROLE_PERMISSIONS = {
  admin: {
    accessAdminPanel: true,
    views: ['mesa', 'tesoreria', 'stats', 'usuarios', 'noticias', 'config'],
    canManageRoles: true,
    mustFilterByGroup: true
  },
  analista: {
    accessAdminPanel: true,
    views: ['mesa'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  rh: {
    accessAdminPanel: true,
    views: ['mesa', 'usuarios'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  aprobador: {
    accessAdminPanel: true,
    views: ['mesa'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  tesorero: {
    accessAdminPanel: true,
    views: ['tesoreria'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  marketing: {
    accessAdminPanel: true,
    views: ['noticias', 'stats'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  cliente: {
    accessAdminPanel: false,
    views: [],
    canManageRoles: false
  }
};