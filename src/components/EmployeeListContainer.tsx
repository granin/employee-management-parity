// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeListContainer.tsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Employee, EmployeeFilters, EmployeeStatus, Team } from '../types/employee';
import EmployeeEditDrawer from './EmployeeEditDrawer';

// ========================
// FOUNDATION COMPONENT 1: Employee List Container
// Based on successful patterns from Chat 6 (PersonalSchedule.tsx style)
// ========================

interface EmployeeListContainerProps {
  employees: Employee[];
  onEmployeesChange: (updater: (prev: Employee[]) => Employee[]) => void;
  onAddEmployee: () => void;
  focusEmployeeId?: string | null;
}

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активен',
  vacation: 'В отпуске',
  probation: 'Испытательный',
  inactive: 'Неактивен',
  terminated: 'Уволен'
};

const STATUS_BADGE_CLASSES: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  vacation: 'bg-yellow-100 text-yellow-800',
  probation: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800'
};

const COLUMN_STORAGE_KEY = 'employee-management:list-columns';
const FILTER_STORAGE_KEY = 'employee-management:list-filters';

const EmployeeListContainer: React.FC<EmployeeListContainerProps> = ({
  employees,
  onEmployeesChange,
  onAddEmployee,
  focusEmployeeId = null
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(focusEmployeeId);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState({
    fio: true,
    position: true,
    orgUnit: true,
    team: true,
    scheme: true,
    hourNorm: true,
    status: true,
    hireDate: true
  });
  const [showTagManager, setShowTagManager] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const hasLoadedColumns = useRef(false);
  const hasLoadedFilters = useRef(false);

  const buildDefaultFilters = useCallback((): EmployeeFilters => ({
    search: '',
    team: '',
    status: '',
    skill: '',
    position: '',
    orgUnit: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showInactive: false
  }), []);

  const [filters, setFilters] = useState<EmployeeFilters>(buildDefaultFilters);
  const defaultFilters = useMemo(() => buildDefaultFilters(), [buildDefaultFilters]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    setActiveEmployeeId(focusEmployeeId ?? null);
  }, [focusEmployeeId]);

  const activeEmployee = useMemo(() => {
    if (!activeEmployeeId) {
      return null;
    }
    return employees.find(emp => emp.id === activeEmployeeId) ?? null;
  }, [employees, activeEmployeeId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      hasLoadedColumns.current = true;
      return;
    }

    try {
      const storedColumns = window.localStorage.getItem(COLUMN_STORAGE_KEY);
      if (storedColumns) {
        const parsed = JSON.parse(storedColumns) as Partial<typeof columnVisibility>;
        setColumnVisibility(prev => {
          hasLoadedColumns.current = true;
          return { ...prev, ...parsed };
        });
        return;
      }
    } catch (storageError) {
      console.warn('Не удалось восстановить настройки колонок', storageError);
    }

    hasLoadedColumns.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedColumns.current || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      hasLoadedFilters.current = true;
      return;
    }

    try {
      const storedFilters = window.localStorage.getItem(FILTER_STORAGE_KEY);
      if (storedFilters) {
        const parsed = JSON.parse(storedFilters) as Partial<EmployeeFilters>;
        setFilters(prev => {
          hasLoadedFilters.current = true;
          return { ...prev, ...parsed };
        });
        return;
      }
    } catch (storageError) {
      console.warn('Не удалось восстановить фильтры сотрудников', storageError);
    }

    hasLoadedFilters.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedFilters.current || typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);


  useEffect(() => {
    setShowBulkActions(selectedEmployees.size > 0);
  }, [selectedEmployees]);

  useEffect(() => {
    if (activeEmployeeId && !employees.some(emp => emp.id === activeEmployeeId)) {
      setActiveEmployeeId(null);
    }
  }, [employees, activeEmployeeId]);

  const columnOrder = useMemo(() => (
    [
      { key: 'fio' as const, label: 'Ф.И.О.' },
      { key: 'position' as const, label: 'Должность' },
      { key: 'orgUnit' as const, label: 'Точка оргструктуры' },
      { key: 'team' as const, label: 'Команда' },
      { key: 'scheme' as const, label: 'Схема работы' },
      { key: 'hourNorm' as const, label: 'Норма часов' },
      { key: 'status' as const, label: 'Статус' },
      { key: 'hireDate' as const, label: 'Дата найма' }
    ]
  ), []);

  const teamOptions = useMemo(() => {
    const map = new Map<string, Team>();
    employees.forEach(emp => {
      map.set(emp.workInfo.team.id, emp.workInfo.team);
    });
    return Array.from(map.values());
  }, [employees]);

  const positionOptions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(emp => set.add(emp.workInfo.position));
    return Array.from(set.values());
  }, [employees]);

  const orgUnitOptions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(emp => set.add(emp.orgPlacement.orgUnit));
    return Array.from(set.values());
  }, [employees]);

  const statusOptions = useMemo(() => (
    ['active', 'probation', 'vacation', 'inactive', 'terminated'] as EmployeeStatus[]
  ), []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      if (!filters.showInactive && employee.status === 'terminated') {
        return false;
      }

      const search = filters.search.trim().toLowerCase();
      if (search) {
        const searchTarget = [
          employee.personalInfo.lastName,
          employee.personalInfo.firstName,
          employee.personalInfo.middleName ?? '',
          employee.workInfo.position,
          employee.credentials.wfmLogin,
          ...employee.credentials.externalLogins
        ]
          .join(' ')
          .toLowerCase();

        if (!searchTarget.includes(search)) {
          return false;
        }
      }

      if (filters.team && employee.workInfo.team.id !== filters.team) {
        return false;
      }

      if (filters.status && employee.status !== filters.status) {
        return false;
      }

      if (filters.position && employee.workInfo.position !== filters.position) {
        return false;
      }

      if (filters.orgUnit && employee.orgPlacement.orgUnit !== filters.orgUnit) {
        return false;
      }

      if (filters.skill) {
        const hasSkill = employee.skills.some(skill => skill.name === filters.skill) ||
          employee.reserveSkills.some(skill => skill.name === filters.skill);
        if (!hasSkill) {
          return false;
        }
      }

      return true;
    });
  }, [employees, filters]);

  const sortedEmployees = useMemo(() => {
    const data = [...filteredEmployees];
    data.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'position':
          aValue = a.workInfo.position;
          bValue = b.workInfo.position;
          break;
        case 'team':
          aValue = a.workInfo.team.name;
          bValue = b.workInfo.team.name;
          break;
        case 'hireDate':
          aValue = a.workInfo.hireDate.getTime();
          bValue = b.workInfo.hireDate.getTime();
          break;
        case 'performance':
          aValue = a.performance.qualityScore;
          bValue = b.performance.qualityScore;
          break;
        case 'name':
        default:
          aValue = `${a.personalInfo.lastName} ${a.personalInfo.firstName} ${a.personalInfo.middleName ?? ''}`.trim();
          bValue = `${b.personalInfo.lastName} ${b.personalInfo.firstName} ${b.personalInfo.middleName ?? ''}`.trim();
          break;
      }

      let compare: number;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        compare = (aValue as number) - (bValue as number);
      } else {
        compare = String(aValue).localeCompare(String(bValue), 'ru');
      }

      return filters.sortOrder === 'asc' ? compare : -compare;
    });

    return data;
  }, [filteredEmployees, filters.sortBy, filters.sortOrder]);

  useEffect(() => {
    setSelectedEmployees(prev => {
      const allowed = new Set(sortedEmployees.map(emp => emp.id));
      const filtered = Array.from(prev).filter(id => allowed.has(id));
      if (filtered.length === prev.size) {
        return prev;
      }
      return new Set(filtered);
    });
  }, [sortedEmployees]);

  useEffect(() => {
    if (activeEmployeeId && !sortedEmployees.some(emp => emp.id === activeEmployeeId)) {
      setActiveEmployeeId(null);
    }
  }, [activeEmployeeId, sortedEmployees]);

  const totalCount = employees.length;
  const visibleCount = sortedEmployees.length;
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== defaultFilters.search ||
      filters.team !== defaultFilters.team ||
      filters.status !== defaultFilters.status ||
      filters.position !== defaultFilters.position ||
      filters.orgUnit !== defaultFilters.orgUnit ||
      filters.skill !== defaultFilters.skill ||
      filters.showInactive !== defaultFilters.showInactive
    );
  }, [filters, defaultFilters]);

  const filterChips = useMemo(() => {
    const chips: Array<{ key: keyof EmployeeFilters; label: string; value?: string }> = [];

    if (filters.search.trim()) {
      chips.push({ key: 'search', label: 'Поиск', value: filters.search.trim() });
    }

    if (filters.team) {
      const teamName = teamOptions.find(team => team.id === filters.team)?.name ?? filters.team;
      chips.push({ key: 'team', label: 'Команда', value: teamName });
    }

    if (filters.status) {
      const statusKey = filters.status as EmployeeStatus;
      chips.push({ key: 'status', label: 'Статус', value: STATUS_LABELS[statusKey] });
    }

    if (filters.position) {
      chips.push({ key: 'position', label: 'Должность', value: filters.position });
    }

    if (filters.orgUnit) {
      chips.push({ key: 'orgUnit', label: 'Точка оргструктуры', value: filters.orgUnit });
    }

    if (filters.showInactive) {
      chips.push({ key: 'showInactive', label: 'Показывать уволенных' });
    }

    return chips;
  }, [filters, teamOptions]);

  const handleFilterChange = useCallback(<K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilter = useCallback(<K extends keyof EmployeeFilters>(key: K) => {
    setFilters(prev => ({ ...prev, [key]: defaultFilters[key] }));
  }, [defaultFilters]);

  const handleRemoveChip = useCallback((key: keyof EmployeeFilters) => {
    clearFilter(key);
  }, [clearFilter]);

  const exportFilename = useMemo(() => `employees_export_${new Date().toISOString().slice(0, 10)}.csv`, []);

  const handleResetFilters = useCallback(() => {
    const reset = buildDefaultFilters();
    setFilters(reset);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FILTER_STORAGE_KEY);
    }
  }, [buildDefaultFilters]);

  const toggleEmployeeSelection = useCallback((employeeId: string) => {
    setSelectedEmployees(prev => {
      const next = new Set(prev);
      if (next.has(employeeId)) {
        next.delete(employeeId);
      } else {
        next.add(employeeId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedEmployees(prev => {
      if (sortedEmployees.length === 0) {
        return new Set();
      }

      if (prev.size === sortedEmployees.length) {
        return new Set();
      }

      return new Set(sortedEmployees.map(emp => emp.id));
    });
  }, [sortedEmployees]);

  const clearSelection = useCallback(() => {
    setSelectedEmployees(new Set());
  }, []);

  const allSelected = sortedEmployees.length > 0 && selectedEmployees.size === sortedEmployees.length;

  const formatDate = (date: Date) => date.toLocaleDateString('ru-RU');

  const handleEmployeeUpdate = useCallback((updatedEmployee: Employee) => {
    onEmployeesChange(prev => prev.map(emp => (emp.id === updatedEmployee.id ? updatedEmployee : emp)));
    setActiveEmployeeId(updatedEmployee.id);
  }, [onEmployeesChange]);

  const toggleColumnVisibility = (key: keyof typeof columnVisibility) => {
    setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetColumnVisibility = () => {
    setColumnVisibility({
      fio: true,
      position: true,
      orgUnit: true,
      team: true,
      scheme: true,
      hourNorm: true,
      status: true,
      hireDate: true
    });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(COLUMN_STORAGE_KEY);
    }
  };

  const handleApplyTags = () => {
    const trimmed = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    if (selectedEmployees.size === 0) {
      setTagError('Выберите хотя бы одного сотрудника');
      return;
    }

    if (trimmed.length === 0) {
      setTagError('Укажите хотя бы один тег');
      return;
    }

    onEmployeesChange(prev => prev.map(emp => {
      if (!selectedEmployees.has(emp.id)) {
        return emp;
      }

      const updatedTags = Array.from(new Set([...emp.tags, ...trimmed]));
      return {
        ...emp,
        tags: updatedTags,
        metadata: {
          ...emp.metadata,
          updatedAt: new Date()
        }
      };
    }));

    setTagInput('');
    setTagError(null);
    setShowTagManager(false);
  };

  const openImportModal = () => {
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImportModal(false);
  };

  const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImportSummary(null);
      return;
    }

    const sizeKb = (file.size / 1024).toFixed(1);
    setImportSummary(`${file.name} • ${sizeKb} КБ`);
  };

  const triggerImportFilePicker = () => {
    fileInputRef.current?.click();
  };

  const closeExportModal = () => {
    setShowExportModal(false);
  };

  const handleDownloadCsv = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const visibleColumns = columnOrder.filter(column => columnVisibility[column.key]);
    const columnsForExport = visibleColumns.length > 0
      ? visibleColumns
      : ([{ key: 'fio' as const, label: 'Ф.И.О.' }] as Array<typeof columnOrder[number]>);
    const headers = columnsForExport.map(column => column.label);

    const formatCell = (employee: Employee, key: typeof columnOrder[number]['key']) => {
      switch (key) {
        case 'fio':
          return `${employee.personalInfo.lastName} ${employee.personalInfo.firstName} ${employee.personalInfo.middleName ?? ''}`.trim();
        case 'position':
          return employee.workInfo.position;
        case 'orgUnit':
          return employee.orgPlacement.orgUnit;
        case 'team':
          return employee.workInfo.team.name;
        case 'scheme':
          return employee.orgPlacement.workScheme?.name ?? '';
        case 'hourNorm':
          return employee.orgPlacement.hourNorm ? `${employee.orgPlacement.hourNorm}` : '';
        case 'status':
          return STATUS_LABELS[employee.status];
        case 'hireDate':
          return formatDate(employee.workInfo.hireDate);
        default:
          return '';
      }
    };

    const rows = sortedEmployees.map(employee =>
      columnsForExport.map(column => formatCell(employee, column.key))
    );

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csvMatrix = [headers, ...rows];
    const csvContent = csvMatrix
      .map(row => row.map(cell => escapeCsv(String(cell ?? ''))).join(';'))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = exportFilename;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    setShowExportModal(false);
  }, [columnOrder, columnVisibility, sortedEmployees, exportFilename]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-6 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
            <p className="text-gray-600">
              Актуальный список персонала с ключевыми полями карточки и статусами
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(prev => !prev)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
            </button>
            <button
              type="button"
              onClick={onAddEmployee}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + Новый сотрудник
            </button>
          </div>
        </div>

        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-blue-900">
            <span>Выбрано сотрудников: {selectedEmployees.size}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                Экспорт
              </button>
              <button
                type="button"
                className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
              >
                Изменить статус
              </button>
              <button
                type="button"
                onClick={clearSelection}
                className="text-xs font-medium text-blue-800 hover:underline"
              >
                Очистить
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowColumnSettings(true)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                🗂️ Настройка отображения
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagError(null);
                  setShowTagManager(true);
                }}
                disabled={selectedEmployees.size === 0}
                className={`px-3 py-1.5 border border-gray-300 rounded-lg text-sm transition-colors ${
                  selectedEmployees.size === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🏷️ Теги
              </button>
              <button
                type="button"
                onClick={openImportModal}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ⬇️ Импортировать
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ⬆️ Экспортировать
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={filters.showInactive}
                  onChange={event => handleFilterChange('showInactive', event.target.checked)}
                />
                <span>Показывать уволенных</span>
              </label>
              <span>{visibleCount}/{totalCount}</span>
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className={`text-sm font-medium ${hasActiveFilters ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-default'}`}
              >
                Снять все фильтры
              </button>
            </div>
          </div>

          {filterChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {filterChips.map(chip => (
                <span
                  key={`${chip.key}-${chip.value ?? 'value'}`}
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-sm"
                >
                  <span className="text-sm">{chip.value ? `${chip.label}: ${chip.value}` : chip.label}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(chip.key)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label={`Удалить фильтр ${chip.label}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {showFilters && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Поиск</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={event => handleFilterChange('search', event.target.value)}
                    placeholder="ФИО, логин, должность"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Команда</label>
                  <select
                    value={filters.team}
                    onChange={event => handleFilterChange('team', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все команды</option>
                    {teamOptions.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Статус</label>
                  <select
                    value={filters.status}
                    onChange={event => handleFilterChange('status', event.target.value as EmployeeStatus | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все статусы</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Должность</label>
                  <select
                    value={filters.position}
                    onChange={event => handleFilterChange('position', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все должности</option>
                    {positionOptions.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Точка оргструктуры</label>
                  <select
                    value={filters.orgUnit}
                    onChange={event => handleFilterChange('orgUnit', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все точки</option>
                    {orgUnitOptions.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Сортировка</label>
                  <select
                    value={filters.sortBy}
                    onChange={event => handleFilterChange('sortBy', event.target.value as EmployeeFilters['sortBy'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="name">ФИО</option>
                    <option value="position">Должность</option>
                    <option value="team">Команда</option>
                    <option value="hireDate">Дата найма</option>
                    <option value="performance">Качество обслуживания</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Порядок</label>
                  <select
                    value={filters.sortOrder}
                    onChange={event => handleFilterChange('sortOrder', event.target.value as EmployeeFilters['sortOrder'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asc">Возрастание</option>
                    <option value="desc">Убывание</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {visibleCount === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Сотрудники не найдены</h3>
          <p className="text-sm">Измените фильтры или снимите ограничения, чтобы увидеть сотрудников</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={allSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                {columnVisibility.fio && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ф.И.О.</th>
                )}
                {columnVisibility.position && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Должность</th>
                )}
                {columnVisibility.orgUnit && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Точка оргструктуры</th>
                )}
                {columnVisibility.team && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Команда</th>
                )}
                {columnVisibility.scheme && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Схема работы</th>
                )}
                {columnVisibility.hourNorm && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Норма часов</th>
                )}
                {columnVisibility.status && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Статус</th>
                )}
                {columnVisibility.hireDate && (
                  <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Дата найма</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {sortedEmployees.map(employee => {
                const isSelected = selectedEmployees.has(employee.id);
                const isActiveRow = activeEmployee?.id === employee.id;

                return (
                  <tr
                    key={employee.id}
                    tabIndex={0}
                    onClick={() => setActiveEmployeeId(employee.id)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActiveEmployeeId(employee.id);
                      }
                    }}
                    aria-selected={isActiveRow}
                    className={`cursor-pointer transition-colors ${isActiveRow ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600 focus:ring-blue-500"
                        checked={isSelected}
                        onChange={event => {
                          event.stopPropagation();
                          toggleEmployeeSelection(employee.id);
                        }}
                      />
                    </td>
                    {columnVisibility.fio && (
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={employee.personalInfo.photo || 'https://i.pravatar.cc/40?img=1'}
                            alt={`${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-gray-900">
                              {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                            </div>
                            <div className="text-xs text-gray-500">{employee.credentials.wfmLogin}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {columnVisibility.position && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700">{employee.workInfo.position}</td>
                    )}
                    {columnVisibility.orgUnit && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700">{employee.orgPlacement.orgUnit}</td>
                    )}
                    {columnVisibility.team && (
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: employee.workInfo.team.color }}
                          ></span>
                          <span className="text-gray-700">{employee.workInfo.team.name}</span>
                        </div>
                      </td>
                    )}
                    {columnVisibility.scheme && (
                      <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                        {employee.orgPlacement.workScheme?.name ?? '—'}
                      </td>
                    )}
                    {columnVisibility.hourNorm && (
                      <td className="px-6 py-3 whitespace-nowrap text-center text-gray-700">
                        {employee.orgPlacement.hourNorm ? `${employee.orgPlacement.hourNorm} ч` : '—'}
                      </td>
                    )}
                    {columnVisibility.status && (
                      <td className="px-6 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE_CLASSES[employee.status]}`}>
                          {STATUS_LABELS[employee.status]}
                        </span>
                      </td>
                    )}
                    {columnVisibility.hireDate && (
                      <td className="px-6 py-3 whitespace-nowrap text-center text-gray-700">
                        {formatDate(employee.workInfo.hireDate)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>

      {showColumnSettings && (
        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={() => setShowColumnSettings(false)}>
          <div
            className="ml-auto h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Настройка отображения</h3>
              <button
                type="button"
                onClick={() => setShowColumnSettings(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {columnOrder.map(column => (
                <label key={column.key} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={columnVisibility[column.key]}
                    onChange={() => toggleColumnVisibility(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
              <button
                type="button"
                onClick={resetColumnVisibility}
                className="text-sm text-blue-600 hover:underline"
              >
                Восстановить по умолчанию
              </button>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowColumnSettings(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {showTagManager && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => { setShowTagManager(false); setTagInput(''); setTagError(null); }}>
          <div
            className="bg-white rounded-xl max-w-lg w-full shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Управление тегами</h3>
                <p className="text-sm text-gray-500">См. Appendix 6 — Tag Import Template</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowTagManager(false); setTagInput(''); setTagError(null); }}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-600">
                Выбрано сотрудников: <span className="font-medium">{selectedEmployees.size}</span>. Новые теги будут добавлены к существующим.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Теги через запятую</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={event => {
                    setTagInput(event.target.value);
                    if (tagError) setTagError(null);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${tagError ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="VIP, Норма, План"
                />
                {tagError && <p className="mt-1 text-xs text-red-600">{tagError}</p>}
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Подсказка</p>
                <p>• Указывайте краткие теги (направление, уровень навыков, график).</p>
                <p>• Для массового импорта используйте Appendix 6.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowTagManager(false); setTagInput(''); setTagError(null); }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleApplyTags}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Добавить теги
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeImportModal}>
          <div
            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Импорт сотрудников</h3>
                <p className="text-sm text-gray-500">Шаблон: Appendix 1 (Employee Import Template)</p>
              </div>
              <button
                type="button"
                onClick={closeImportModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p>1. Скачайте и заполните шаблон Excel с обязательными колонками (логин, ФИО, оргструктура, часы и т.д.).</p>
              <p>2. Проверьте форматы дат и соответствие значений справочникам (см. Appendix 1).</p>
              <p>3. Загрузите файл в модуле &laquo;Импорт&raquo;. Система покажет ошибки в отчёте.</p>
              <p className="text-xs text-gray-500">Дополнительно: Appendix 3 — навыки, Appendix 6 — теги.</p>
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={triggerImportFilePicker}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Выбрать файл
                </button>
                {importSummary ? (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium">{importSummary}</span>
                    <span className="text-xs text-blue-600">Файл принят, проверка запустится после закрытия окна</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Поддерживаются .xlsx, .xls, .csv</p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportFileChange}
            />
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={closeImportModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={closeExportModal}>
          <div
            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Экспорт списка сотрудников</h3>
                <p className="text-sm text-gray-500">Экспортируется текущая выборка и колонки</p>
              </div>
              <button
                type="button"
                onClick={closeExportModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p>Файл формируется в CSV/Excel и повторяет структуру Appendix 1 для удобства обратного импорта.</p>
              <p>Колонки берутся из текущей конфигурации &laquo;Настройки отображения&raquo;.</p>
              <p className="text-xs text-gray-500">Имя файла: {exportFilename}</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeExportModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Скачать CSV
              </button>
            </div>
          </div>
        </div>
      )}

      <EmployeeEditDrawer
        employee={activeEmployee}
        isOpen={Boolean(activeEmployee)}
        onClose={() => setActiveEmployeeId(null)}
        onSave={handleEmployeeUpdate}
      />
    </>
  );
};

export default EmployeeListContainer;
