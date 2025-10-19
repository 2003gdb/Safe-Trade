'use client';

import { useState, useEffect } from 'react';
import { Report, AdminNote } from '../../types';
import { es } from '../../locales/es';
import { adminAPIService } from '../../services/AdminAPIService';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedReport: Report) => void;
  report: Report;
}

export default function StatusUpdateModal({
  isOpen,
  onClose,
  onStatusUpdated,
  report
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusHistory, setStatusHistory] = useState<AdminNote[]>([]);

  // Status transition rules
  const statusTransitions = {
    nuevo: ['revisado', 'en_investigacion', 'cerrado'],
    revisado: ['en_investigacion', 'cerrado'],
    en_investigacion: ['revisado', 'cerrado'],
    cerrado: ['en_investigacion'] // Can reopen if needed
  };

  const statusColors = {
    nuevo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    revisado: 'bg-blue-100 text-blue-800 border-blue-200',
    en_investigacion: 'bg-purple-100 text-purple-800 border-purple-200',
    cerrado: 'bg-green-100 text-green-800 border-green-200'
  };

  const statusLabels = {
    nuevo: 'Nuevo',
    revisado: 'Revisado',
    en_investigacion: 'En Investigación',
    cerrado: 'Cerrado'
  };

  const statusDescriptions = {
    nuevo: 'Reporte recién creado que requiere revisión inicial',
    revisado: 'Reporte revisado por administrador, evaluando próximos pasos',
    en_investigacion: 'Investigación activa en progreso',
    cerrado: 'Caso resuelto o cerrado'
  };

  const noteTemplates = [
    {
      status: 'revisado',
      templates: [
        'Reporte revisado. Información verificada y documentada.',
        'Revisión completada. Se requiere investigación adicional.',
        'Información validada. Proceder con investigación estándar.'
      ]
    },
    {
      status: 'en_investigacion',
      templates: [
        'Investigación iniciada. Se están recopilando evidencias adicionales.',
        'Caso escalado para investigación profunda debido a la gravedad.',
        'Investigación colaborativa iniciada con autoridades competentes.'
      ]
    },
    {
      status: 'cerrado',
      templates: [
        'Caso resuelto satisfactoriamente. Medidas correctivas implementadas.',
        'Investigación completada. No se encontró evidencia de amenaza real.',
        'Caso cerrado por duplicado con reporte anterior.',
        'Usuario informado sobre medidas de seguridad preventivas.'
      ]
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(report.status);
      setAdminNotes('');
      setError(null);
      loadStatusHistory();
    }
  }, [isOpen, report]);

  const loadStatusHistory = async () => {
    try {
      const notes = await adminAPIService.getReportNotes(report.id);
      setStatusHistory(notes.filter(note => note.content.includes('Estado cambiado')));
    } catch (error) {
      console.error('Error loading status history:', error);
    }
  };

  const getAvailableStatuses = () => {
    const available = statusTransitions[report.status as keyof typeof statusTransitions] || [];
    return available.filter(status => status !== report.status);
  };

  const getStatusChangeReason = (fromStatus: string, toStatus: string) => {
    const reasons = {
      'nuevo->revisado': 'Revisión inicial completada',
      'nuevo->en_investigacion': 'Caso requiere investigación inmediata',
      'nuevo->cerrado': 'Resolución rápida sin investigación',
      'revisado->en_investigacion': 'Evidencia suficiente para investigación formal',
      'revisado->cerrado': 'Caso resuelto durante la revisión',
      'en_investigacion->revisado': 'Investigación pausada, requiere más información',
      'en_investigacion->cerrado': 'Investigación completada',
      'cerrado->en_investigacion': 'Caso reabierto para investigación adicional'
    };

    return reasons[`${fromStatus}->${toStatus}` as keyof typeof reasons] || 'Cambio de estado';
  };

  const validateStatusChange = () => {
    if (selectedStatus === report.status) {
      setError('Debe seleccionar un estado diferente al actual');
      return false;
    }

    const availableStatuses = getAvailableStatuses();
    if (!availableStatuses.includes(selectedStatus)) {
      setError('Transición de estado no permitida');
      return false;
    }

    if (!adminNotes.trim()) {
      setError('Las notas administrativas son requeridas para cambios de estado');
      return false;
    }

    if (adminNotes.trim().length < 10) {
      setError('Las notas deben tener al menos 10 caracteres');
      return false;
    }

    return true;
  };

  const handleStatusUpdate = async () => {
    if (!validateStatusChange()) return;

    setIsLoading(true);
    setError(null);

    try {
      const statusChangeReason = getStatusChangeReason(report.status, selectedStatus);
      const fullNotes = `${statusChangeReason}

${adminNotes}

Estado anterior: ${statusLabels[report.status as keyof typeof statusLabels]}
Estado nuevo: ${statusLabels[selectedStatus as keyof typeof statusLabels]}
Fecha de cambio: ${new Date().toLocaleString('es-ES')}`;

      const updatedReport = await adminAPIService.updateReportStatus(report.id, {
        status: selectedStatus,
        adminNotes: fullNotes
      });

      // Add status change note
      await adminAPIService.addReportNote(
        report.id,
        `Estado cambiado de "${statusLabels[report.status as keyof typeof statusLabels]}" a "${statusLabels[selectedStatus as keyof typeof statusLabels]}"`,
        false
      );

      onStatusUpdated(updatedReport);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar estado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setAdminNotes(template);
  };

  if (!isOpen) return null;

  const availableStatuses = getAvailableStatuses();
  const relevantTemplates = noteTemplates.find(t => t.status === selectedStatus)?.templates || [];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            Actualizar Estado del Reporte #{report.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current Status */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Estado Actual</h4>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[report.status as keyof typeof statusColors]}`}>
            {statusLabels[report.status as keyof typeof statusLabels]}
          </div>
          <p className="mt-1 text-sm text-gray-600">
            {statusDescriptions[report.status as keyof typeof statusDescriptions]}
          </p>
        </div>

        {/* New Status Selection */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Nuevo Estado</h4>
          {availableStatuses.length > 0 ? (
            <div className="space-y-2">
              {availableStatuses.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status as keyof typeof statusColors]}`}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {statusDescriptions[status as keyof typeof statusDescriptions]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay transiciones de estado disponibles desde el estado actual.
            </p>
          )}
        </div>

        {/* Status Change Reason */}
        {selectedStatus !== report.status && (
          <div className="mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Razón del cambio:</strong> {getStatusChangeReason(report.status, selectedStatus)}
              </p>
            </div>
          </div>
        )}

        {/* Admin Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Administrativas *
          </label>

          {/* Template Suggestions */}
          {relevantTemplates.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Plantillas sugeridas:</p>
              <div className="space-y-1">
                {relevantTemplates.map((template, templateIndex) => (
                  <button
                    key={templateIndex}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            placeholder="Describa las razones del cambio de estado, acciones tomadas, y próximos pasos..."
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mínimo 10 caracteres. Estas notas quedarán registradas en el historial del reporte.
          </p>
        </div>


        {/* Status History */}
        {statusHistory.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Historial de Estados</h4>
            <div className="bg-gray-50 rounded-md p-3 max-h-32 overflow-y-auto">
              {statusHistory.map((note) => (
                <div key={note.id} className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">{note.adminName}:</span> {note.content}
                  <span className="text-gray-400 ml-2">
                    {new Date(note.createdAt).toLocaleString('es-ES')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {es.common.cancel}
          </button>
          <button
            onClick={handleStatusUpdate}
            disabled={isLoading || selectedStatus === report.status || !adminNotes.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </span>
            ) : (
              'Actualizar Estado'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}