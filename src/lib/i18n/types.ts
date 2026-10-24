export type Locale = "en" | "ka";

export interface Dictionary {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    close: string;
    loading: string;
    back: string;
    search: string;
    filter: string;
    select: string;
    actions: string;
    confirm: string;
    undo: string;
    copy: string;
    copied: string;
    retry: string;
    refresh: string;
    all: string;
    none: string;
    status: string;
    priority: string;
    assignee: string;
    dueDate: string;
    title: string;
    description: string;
    noResults: string;
    unassigned: string;
  };
  brand: {
    name: string;
    nameEn: string;
    nameKa: string;
    tagline: string;
    subtagline: string;
  };
  nav: {
    dashboard: string;
    myTasks: string;
    projects: string;
    notifications: string;
    settings: string;
    signOut: string;
    newTask: string;
    newProject: string;
    newWorkspace: string;
    searchPlaceholder: string;
    switchWorkspace: string;
    createWorkspace: string;
  };
  priorities: {
    NONE: string;
    LOW: string;
    MEDIUM: string;
    HIGH: string;
    URGENT: string;
  };
  statuses: {
    TODO: string;
    IN_PROGRESS: string;
    REVIEW: string;
    DONE: string;
  };
  roles: {
    OWNER: string;
    ADMIN: string;
    MEMBER: string;
    VIEWER: string;
  };
  projectStatuses: {
    PLANNING: string;
    ACTIVE: string;
    ON_HOLD: string;
    COMPLETED: string;
    ARCHIVED: string;
  };
  tasks: {
    quickCreate: string;
    createTask: string;
    editTask: string;
    taskTitle: string;
    taskTitlePlaceholder: string;
    descriptionPlaceholder: string;
    selectProject: string;
    selectColumn: string;
    selectAssignee: string;
    selectPriority: string;
    subtasks: string;
    subtaskProgress: string;
    addSubtask: string;
    newSubtaskPlaceholder: string;
    dependencies: string;
    addDependency: string;
    blockedBy: string;
    blocking: string;
    noDependencies: string;
    cycleDetected: string;
    timeTracking: string;
    startTimer: string;
    stopTimer: string;
    manualLog: string;
    durationMinutes: string;
    logTime: string;
    totalTimeSpent: string;
    comments: string;
    addComment: string;
    writeCommentPlaceholder: string;
    noComments: string;
    activityHistory: string;
    noActivity: string;
    deleteTaskConfirm: string;
    taskCreatedSuccess: string;
    taskUpdatedSuccess: string;
    taskDeletedSuccess: string;
  };
  views: {
    kanban: {
      title: string;
      addColumn: string;
      wipLimit: string;
      wipExceeded: string;
      emptyColumn: string;
      quickAddTask: string;
    };
    list: {
      title: string;
      selectedCount: string;
      bulkStatus: string;
      bulkPriority: string;
      bulkDelete: string;
      noTasks: string;
    };
    calendar: {
      title: string;
      today: string;
      month: string;
      week: string;
      noTasksScheduled: string;
    };
    myTasks: {
      title: string;
      subtitle: string;
      all: string;
      today: string;
      overdue: string;
      upcoming: string;
      completed: string;
      emptyGroup: string;
    };
    analytics: {
      title: string;
      subtitle: string;
      velocity: string;
      teamWorkload: string;
      statusDistribution: string;
      bottlenecks: string;
      totalTasks: string;
      completionRate: string;
      avgTimePerTask: string;
      tasksByPriority: string;
    };
  };
  projects: {
    allProjects: string;
    createProject: string;
    newProject: string;
    projectName: string;
    projectNamePlaceholder: string;
    projectSlug: string;
    projectDescription: string;
    projectDescriptionPlaceholder: string;
    accentColor: string;
    projectStatus: string;
    noProjectsFound: string;
    tabs: {
      board: string;
      list: string;
      calendar: string;
      analytics: string;
      settings: string;
    };
  };
  workspaces: {
    createWorkspace: string;
    workspaceName: string;
    workspaceSlug: string;
    workspaceDescription: string;
    settingsTitle: string;
    membersTab: string;
    generalTab: string;
    inviteMember: string;
    memberEmail: string;
    memberRole: string;
    removeMember: string;
    dangerZone: string;
    deleteWorkspace: string;
  };
  notifications: {
    title: string;
    subtitle: string;
    markAllRead: string;
    noNotifications: string;
    unreadCount: string;
  };
  commandPalette: {
    placeholder: string;
    noResults: string;
    navigation: string;
    actions: string;
    projects: string;
    tasks: string;
    createTask: string;
    createProject: string;
    shortcuts: string;
  };
  shortcuts: {
    title: string;
    subtitle: string;
    globalCategory: string;
    navigationCategory: string;
    actionNewTask: string;
    actionSearch: string;
    actionShortcuts: string;
    actionClose: string;
    navDashboard: string;
    navMyTasks: string;
    navProjects: string;
  };
  theme: {
    toggleTheme: string;
    light: string;
    dark: string;
    system: string;
  };
  lang: {
    switchLanguage: string;
    georgian: string;
    english: string;
  };
}
