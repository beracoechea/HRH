// helpers/permissions.js
export const ROLE_PERMISSIONS = {
  admin: {
    accessAdminPanel: true,
    views: ['usuarios', 'pendientes', 'creditos', 'documentos', 'stats', 'noticias'],
    canManageRoles: true
  },
  aprobador: {
    accessAdminPanel: true,
    views: ['pendientes', 'creditos', 'documentos'],
    canManageRoles: false
  },
  tesorero: {
    accessAdminPanel: true,
    views: ['creditos'],
    canManageRoles: false
  },
  marketing: {
    accessAdminPanel: true,
    views: ['noticias'],
    canManageRoles: false
  },
  cliente: {
    accessAdminPanel: false,
    views: [],
    canManageRoles: false
  }
};