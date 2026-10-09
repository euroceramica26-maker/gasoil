import { User, UserRole, UserPermissions } from '../types';

export const SUPER_ADMIN_CREDENTIALS = {
  login: 'ouaradtech',
  motDePasse: 'Ouaradtech26@'
};

export const FULL_PERMISSIONS: UserPermissions = {
  menus: {
    dashboard: true,
    entries: true,
    dispenses: true,
    citernes: true,
    vehicles: true,
    gestion: true,
    fournisseurs: true,
    users: true,
    repairs: true,
    alerts: true,
    architecture: true,
    controle_total: true
  },
  options: {
    canAddEntries: true,
    canAddDispenses: true,
    canExportReports: true,
    canPrintReceipts: true,
    canManageCiternes: true,
    canManageVehicles: true,
    canManageUsers: true,
    canManageSubscriptions: true,
    canManageSecurity: true,
    canEmergencyLockdown: true
  }
};

export const SUPER_ADMIN_USER: User = {
  id: 'usr-superadmin',
  matricule: 'OUARAD-001',
  login: 'ouaradtech',
  motDePasse: 'Ouaradtech26@',
  nom: 'OuaradTech',
  prenom: 'Super Admin',
  role: 'Super Administrateur',
  email: 'admin@ouaradtech.com',
  telephone: '+212 6 61 00 26 26',
  statut: 'Actif',
  badgeCode: 'RFID-SUPER-MASTER-001',
  departement: 'Direction Générale OuaradTech (Tous Droits)',
  dateCreation: '2024-01-01',
  permissions: FULL_PERMISSIONS
};

export const getDefaultPermissionsForRole = (role: UserRole): UserPermissions => {
  if (role === 'Super Administrateur') {
    return JSON.parse(JSON.stringify(FULL_PERMISSIONS));
  }

  if (role === 'Administrateur') {
    return {
      menus: {
        dashboard: true,
        entries: true,
        dispenses: true,
        citernes: true,
        vehicles: true,
        gestion: true,
        fournisseurs: true,
        users: true,
        repairs: true,
        alerts: true,
        architecture: true,
        controle_total: true
      },
      options: {
        canAddEntries: true,
        canAddDispenses: true,
        canExportReports: true,
        canPrintReceipts: true,
        canManageCiternes: true,
        canManageVehicles: true,
        canManageUsers: true,
        canManageSubscriptions: false,
        canManageSecurity: false,
        canEmergencyLockdown: false
      }
    };
  }

  if (role === 'Chef de Dépôt') {
    return {
      menus: {
        dashboard: true,
        entries: true,
        dispenses: true,
        citernes: true,
        vehicles: true,
        gestion: true,
        fournisseurs: true,
        users: false,
        repairs: true,
        alerts: true,
        architecture: false,
        controle_total: false
      },
      options: {
        canAddEntries: true,
        canAddDispenses: true,
        canExportReports: true,
        canPrintReceipts: true,
        canManageCiternes: true,
        canManageVehicles: true,
        canManageUsers: false,
        canManageSubscriptions: false,
        canManageSecurity: false,
        canEmergencyLockdown: false
      }
    };
  }

  if (role === 'Pompiste') {
    return {
      menus: {
        dashboard: true,
        entries: true,
        dispenses: true,
        citernes: true,
        vehicles: false,
        gestion: false,
        fournisseurs: false,
        users: false,
        repairs: false,
        alerts: true,
        architecture: false,
        controle_total: false
      },
      options: {
        canAddEntries: true,
        canAddDispenses: true,
        canExportReports: false,
        canPrintReceipts: true,
        canManageCiternes: false,
        canManageVehicles: false,
        canManageUsers: false,
        canManageSubscriptions: false,
        canManageSecurity: false,
        canEmergencyLockdown: false
      }
    };
  }

  if (role === 'Responsable Maintenance') {
    return {
      menus: {
        dashboard: true,
        entries: false,
        dispenses: true,
        citernes: true,
        vehicles: true,
        gestion: false,
        fournisseurs: true,
        users: false,
        repairs: true,
        alerts: true,
        architecture: false,
        controle_total: false
      },
      options: {
        canAddEntries: false,
        canAddDispenses: false,
        canExportReports: true,
        canPrintReceipts: false,
        canManageCiternes: false,
        canManageVehicles: true,
        canManageUsers: false,
        canManageSubscriptions: false,
        canManageSecurity: false,
        canEmergencyLockdown: false
      }
    };
  }

  if (role === 'Chauffeur / Opérateur') {
    return {
      menus: {
        dashboard: true,
        entries: false,
        dispenses: true,
        citernes: false,
        vehicles: true,
        gestion: false,
        fournisseurs: false,
        users: false,
        repairs: false,
        alerts: false,
        architecture: false,
        controle_total: false
      },
      options: {
        canAddEntries: false,
        canAddDispenses: false,
        canExportReports: false,
        canPrintReceipts: false,
        canManageCiternes: false,
        canManageVehicles: false,
        canManageUsers: false,
        canManageSubscriptions: false,
        canManageSecurity: false,
        canEmergencyLockdown: false
      }
    };
  }

  // Client / Opérateur Invité (Consultation)
  return {
    menus: {
      dashboard: true,
      entries: false,
      dispenses: true,
      citernes: true,
      vehicles: true,
      gestion: false,
      fournisseurs: false,
      users: false,
      repairs: false,
      alerts: true,
      architecture: false,
      controle_total: false
    },
    options: {
      canAddEntries: false,
      canAddDispenses: false,
      canExportReports: true,
      canPrintReceipts: false,
      canManageCiternes: false,
      canManageVehicles: false,
      canManageUsers: false,
      canManageSubscriptions: false,
      canManageSecurity: false,
      canEmergencyLockdown: false
    }
  };
};

export const ensureUserPermissions = (user: User): User => {
  if (user.role === 'Super Administrateur' || user.login?.toLowerCase() === 'ouaradtech') {
    return {
      ...user,
      role: 'Super Administrateur',
      permissions: JSON.parse(JSON.stringify(FULL_PERMISSIONS))
    };
  }

  if (!user.permissions) {
    return {
      ...user,
      permissions: getDefaultPermissionsForRole(user.role)
    };
  }

  return user;
};
