// helpers/permissions.js
export const ROLE_PERMISSIONS = {
  admin: {
    accessAdminPanel: true,
    views: ['mesa', 'tesoreria', 'stats', 'usuarios', 'grupos', 'noticias', 'config', 'citas'],
    canManageRoles: true,
    mustFilterByGroup: true
  },
  analista: {
    accessAdminPanel: true,
    views: ['mesa', 'citas'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  rh: {
    accessAdminPanel: true,
    views: ['usuarios', 'citas'],
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
    views: ['noticias', 'stats', 'config'],
    canManageRoles: false,
    mustFilterByGroup: true
  },
  cliente: {
    accessAdminPanel: false,
    views: [],
    canManageRoles: false
  }
};