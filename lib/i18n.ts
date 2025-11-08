export const locales = ['en','es','ca','fr','it'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const dict: Record<Locale, Record<string,string>> = {
  en: { dashboard:'Dashboard', projects:'Projects', tasks:'Tasks', materials:'Materials', logs:'Logs', usersInvites:'Users & Invites', addTask:'Add task', createProject:'Create project', materialsInventory:'Materials & Inventory', logsJournal:'Logs / Journal', signIn:'Sign in', email:'Email', password:'Password', name:'Name', role:'Role', inviteAccept:'Accept Invite', generateInvite:'Generate link', language:'Language' },
  es: { dashboard:'Panel', projects:'Proyectos', tasks:'Tareas', materials:'Materiales', logs:'Bitácora', usersInvites:'Usuarios e invitaciones', addTask:'Añadir tarea', createProject:'Crear proyecto', materialsInventory:'Materiales e inventario', logsJournal:'Registro / Diario', signIn:'Iniciar sesión', email:'Correo', password:'Contraseña', name:'Nombre', role:'Rol', inviteAccept:'Aceptar invitación', generateInvite:'Generar enlace', language:'Idioma' },
  ca: { dashboard:'Tauler', projects:'Projectes', tasks:'Tasques', materials:'Materials', logs:'Registre', usersInvites:'Usuaris i invitacions', addTask:'Afegeix tasca', createProject:'Crea projecte', materialsInventory:'Materials i inventari', logsJournal:'Registre / Diari', signIn:'Inicia sessió', email:'Correu', password:'Contrasenya', name:'Nom', role:'Rol', inviteAccept:'Accepta la invitació', generateInvite:'Genera l’enllaç', language:'Llengua' },
  fr: { dashboard:'Tableau de bord', projects:'Projets', tasks:'Tâches', materials:'Matériaux', logs:'Journal', usersInvites:'Utilisateurs & invitations', addTask:'Ajouter une tâche', createProject:'Créer un projet', materialsInventory:'Matériaux & inventaire', logsJournal:'Journal / Carnet', signIn:'Se connecter', email:'E-mail', password:'Mot de passe', name:'Nom', role:'Rôle', inviteAccept:'Accepter l’invitation', generateInvite:'Générer le lien', language:'Langue' },
  it: { dashboard:'Pannello', projects:'Progetti', tasks:'Attività', materials:'Materiali', logs:'Registro', usersInvites:'Utenti e inviti', addTask:'Aggiungi attività', createProject:'Crea progetto', materialsInventory:'Materiali e inventario', logsJournal:'Registro / Diario', signIn:'Accedi', email:'Email', password:'Password', name:'Nome', role:'Ruolo', inviteAccept:'Accetta invito', generateInvite:'Genera link', language:'Lingua' },
};

export function t(lang: Locale, key: string) { return dict[lang]?.[key] || key; }
