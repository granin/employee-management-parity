// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeListContainer.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Employee, Team, EmployeeFilters, ViewModes, EmployeeStatus } from '../types/employee';
import EmployeeEditDrawer from './EmployeeEditDrawer';

// ========================
// FOUNDATION COMPONENT 1: Employee List Container
// Based on successful patterns from Chat 6 (PersonalSchedule.tsx style)
// ========================

interface EmployeeListContainerProps {
  teamId?: string;
  showAll?: boolean;
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

const EmployeeListContainer: React.FC<EmployeeListContainerProps> = ({ 
  teamId, 
  showAll = true 
}) => {
  // State management following Chat 6 patterns
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewModes['current']>('grid');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
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

  const createDefaultFilters = useCallback((): EmployeeFilters => ({
    search: '',
    team: teamId || '',
    status: '',
    skill: '',
    position: '',
    orgUnit: '',
    sortBy: 'name',
    sortOrder: 'asc',
    showInactive: false
  }), [teamId]);

  const [filters, setFilters] = useState<EmployeeFilters>(createDefaultFilters);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Mock data with realistic structure (following Chat 6 data patterns)
  const generateMockEmployees = (): Employee[] => {
    return [
      {
        id: 'emp_001',
        employeeId: 'EMP001',
        status: 'active',
        personalInfo: {
          firstName: 'Динара',
          lastName: 'Абдуллаева',
          middleName: 'Ивановна',
          email: 'dinara.abdullaeva@company.com',
          phone: '+996555123456',
          photo: 'https://i.pravatar.cc/150?img=1',
          address: 'г. Бишкек, проспект Манаса 12',
          emergencyContact: {
            name: 'Марат Абдуллаев',
            phone: '+996555123457',
            relationship: 'супруг'
          }
        },
        credentials: {
          wfmLogin: 'manager1',
          externalLogins: ['1.1'],
          passwordSet: true,
          passwordLastUpdated: new Date('2024-01-05')
        },
        workInfo: {
          position: 'Старший оператор',
          team: {
            id: 't1',
            name: 'Группа поддержки',
            color: '#3b82f6',
            managerId: 'mgr_001',
            memberCount: 12,
            targetUtilization: 0.85
          },
          manager: 'Иванов И.И.',
          hireDate: new Date('2022-03-15'),
          contractType: 'full-time',
          salary: 45000,
          workLocation: 'Офис Бишкек',
          department: 'Клиентская поддержка'
        },
        orgPlacement: {
          orgUnit: 'Отдел качества',
          office: 'Офис Бишкек',
          timeZone: 'Europe/Moscow',
          hourNorm: 40,
          workScheme: {
            id: 'scheme-admin',
            name: 'Административный график',
            effectiveFrom: new Date('2022-03-15')
          }
        },
        skills: [
          {
            id: 's1',
            name: 'Консультирование клиентов',
            level: 5,
            category: 'communication',
            verified: true,
            lastAssessed: new Date('2024-01-15'),
            assessor: 'Иванов И.И.',
            certificationRequired: false,
            priority: 1
          },
          {
            id: 's2',
            name: 'CRM система',
            level: 4,
            category: 'technical',
            verified: true,
            lastAssessed: new Date('2024-02-01'),
            assessor: 'Петров А.В.',
            certificationRequired: true,
            priority: 2
          }
        ],
        reserveSkills: [
          {
            id: 's3',
            name: 'Очередь 3',
            level: 3,
            category: 'product',
            verified: false,
            lastAssessed: new Date('2023-10-20'),
            assessor: 'Сидоров К.К.',
            certificationRequired: false,
            priority: 3
          }
        ],
        tags: ['Плавающий', 'Норма часов', 'План'],
        preferences: {
          preferredShifts: ['morning', 'day'],
          notifications: {
            email: true,
            sms: true,
            push: true,
            scheduleChanges: true,
            announcements: true,
            reminders: true
          },
          language: 'ru',
          workingHours: {
            start: '08:00',
            end: '17:00'
          }
        },
        performance: {
          averageHandleTime: 7.5,
          callsPerHour: 12.5,
          qualityScore: 94,
          adherenceScore: 87,
          customerSatisfaction: 4.8,
          lastEvaluation: new Date('2024-01-30')
        },
        certifications: [],
        metadata: {
          createdAt: new Date('2022-03-15'),
          updatedAt: new Date('2024-02-15'),
          createdBy: 'admin_001',
          lastModifiedBy: 'mgr_001',
          lastLogin: new Date('2024-02-14T09:30:00')
        }
      }
    ];
  };
  const defaultFilters = useMemo(() => createDefaultFilters(), [createDefaultFilters]);

  useEffect(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  // Load employees (following Chat 6 async patterns)
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const mockData = generateMockEmployees();
        setEmployees(mockData);
      } catch (err) {
        setError('Ошибка загрузки данных сотрудников. Попробуйте еще раз.');
        console.error('Employee loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [teamId]);

  useEffect(() => {
    setShowBulkActions(selectedEmployees.size > 0);
  }, [selectedEmployees]);

  useEffect(() => {
    if (activeEmployee && !employees.some(emp => emp.id === activeEmployee.id)) {
      setActiveEmployee(null);
    }
  }, [employees, activeEmployee]);

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
    if (activeEmployee && !sortedEmployees.some(emp => emp.id === activeEmployee.id)) {
      setActiveEmployee(null);
    }
  }, [activeEmployee, sortedEmployees]);

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

  const handleFilterChange = useCallback(<K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ ...defaultFilters });
  }, [defaultFilters]);

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
    setEmployees(prev => prev.map(emp => (emp.id === updatedEmployee.id ? updatedEmployee : emp)));
    setActiveEmployee(updatedEmployee);
  }, []);

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

    setEmployees(prev => prev.map(emp => {
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

  // Loading state (following Chat 6 loading patterns)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">Загрузка сотрудников...</p>
            <p className="text-sm text-gray-600">Получение данных из системы</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (following Chat 6 error patterns)
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">Ошибка загрузки данных</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

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
                onClick={() => setShowImportModal(true)}
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
                    onClick={() => setActiveEmployee(employee)}
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
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setShowImportModal(false)}>
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
                onClick={() => setShowImportModal(false)}
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
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setShowExportModal(false)}>
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
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p>Файл формируется в CSV/Excel и повторяет структуру Appendix 1 для удобства обратного импорта.</p>
              <p>Колонки берутся из текущей конфигурации &laquo;Настройки отображения&raquo;.</p>
              <p className="text-xs text-gray-500">Имя файла: employees_export_{new Date().toISOString().slice(0, 10)}.csv</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
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
        onClose={() => setActiveEmployee(null)}
        onSave={handleEmployeeUpdate}
      />
    </>
  );
};

export default EmployeeListContainer;
