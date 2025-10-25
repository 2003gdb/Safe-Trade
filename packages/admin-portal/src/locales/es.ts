

export const es = {
  
  login: {
    title: 'Acceso Administrativo',
    subtitle: 'Panel de Control SafeTrade',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    invalidCredentials: 'Credenciales inválidas',
    errorLogin: 'Error al iniciar sesión',
    emailRequired: 'El correo electrónico es requerido',
    passwordRequired: 'La contraseña es requerida',
    emailInvalid: 'Formato de correo electrónico inválido'
  },

  
  dashboard: {
    title: 'Panel de Control',
    welcome: 'Bienvenido al Panel Administrativo',
    metrics: {
      totalReports: 'Total de Reportes',
      reportsToday: 'Reportes Hoy',
      criticalReports: 'Reportes Críticos',
      recentTrends: 'Tendencias Recientes'
    },
    noData: 'No hay datos disponibles',
    loadingData: 'Cargando datos...'
  },

  
  reports: {
    title: 'Gestión de Reportes',
    listTitle: 'Lista de Reportes',
    detailTitle: 'Detalle del Reporte',
    noReports: 'No se encontraron reportes',
    searchPlaceholder: 'Buscar reportes...',
    filterByStatus: 'Filtrar por estado',
    filterByAttackType: 'Filtrar por tipo de ataque',
    pagination: {
      previous: 'Anterior',
      next: 'Siguiente',
      of: 'de',
      results: 'resultados'
    },
    columns: {
      id: 'ID',
      attackType: 'Tipo de Ataque',
      incidentDate: 'Fecha del Incidente',
      impactLevel: 'Nivel de Impacto',
      status: 'Estado',
      isAnonymous: 'Anónimo',
      location: 'Ubicación',
      createdAt: 'Fecha de Creación',
      actions: 'Acciones'
    },
    status: {
      nuevo: 'Nuevo',
      revisado: 'Revisado',
      en_investigacion: 'En Investigación',
      cerrado: 'Cerrado'
    },
    attackTypes: {
      email: 'Correo Electrónico',
      SMS: 'Mensajes SMS',
      whatsapp: 'WhatsApp',
      llamada: 'Llamada Telefónica',
      redes_sociales: 'Redes Sociales',
      otro: 'Otro'
    },
    impactLevels: {
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      critico: 'Crítico'
    },
    actions: {
      view: 'Ver',
      edit: 'Editar',
      updateStatus: 'Actualizar Estado',
      addNotes: 'Agregar Notas'
    },
    search: {
      title: 'Búsqueda Avanzada',
      placeholder: 'Buscar en reportes...',
      advancedSearch: 'Búsqueda Avanzada',
      simpleSearch: 'Búsqueda Simple',
      searchInFields: 'Buscar en campos',
      allFields: 'Todos los campos',
      description: 'Descripción',
      location: 'Ubicación',
      deviceInfo: 'Información del Dispositivo',
      evidenceUrls: 'URLs de Evidencia',
      filters: 'Filtros',
      dateRange: 'Rango de Fechas',
      from: 'Desde',
      to: 'Hasta',
      impactLevel: 'Nivel de Impacto',
      anonymousOnly: 'Solo Anónimos',
      identifiedOnly: 'Solo Identificados',
      searchHistory: 'Historial de Búsquedas',
      savedSearches: 'Búsquedas Guardadas',
      saveSearch: 'Guardar Búsqueda',
      saveSearchName: 'Nombre de la búsqueda',
      clearHistory: 'Limpiar Historial',
      noHistory: 'No hay historial de búsquedas',
      noSavedSearches: 'No hay búsquedas guardadas',
      searchResults: 'Resultados de búsqueda',
      resultsCount: 'resultados encontrados',
      highlighting: 'Resaltado de términos',
      score: 'Puntuación'
    },
    notes: {
      title: 'Notas Administrativas',
      addNote: 'Agregar Nota',
      editNote: 'Editar Nota',
      deleteNote: 'Eliminar Nota',
      noteContent: 'Contenido de la nota',
      useTemplate: 'Usar Plantilla',
      selectTemplate: 'Seleccionar plantilla',
      saveAsTemplate: 'Guardar como plantilla',
      templateName: 'Nombre de la plantilla',
      templates: {
        investigation: 'Investigación',
        followUp: 'Seguimiento',
        resolution: 'Resolución',
        escalation: 'Escalación'
      },
      noNotes: 'No hay notas para este reporte',
      noteAdded: 'Nota agregada exitosamente',
      noteUpdated: 'Nota actualizada exitosamente',
      noteDeleted: 'Nota eliminada exitosamente'
    }
  },

  
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    view: 'Ver',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    yes: 'Sí',
    no: 'No',
    logout: 'Cerrar Sesión',
    back: 'Regresar',
    home: 'Inicio',
    dashboard: 'Panel de Control',
    reports: 'Reportes',
    settings: 'Configuración'
  },

  
  errors: {
    networkError: 'Error de conexión de red',
    unauthorized: 'No autorizado. Por favor, inicie sesión nuevamente',
    forbidden: 'No tiene permisos para realizar esta acción',
    notFound: 'Recurso no encontrado',
    serverError: 'Error interno del servidor',
    unknown: 'Error desconocido'
  }
};