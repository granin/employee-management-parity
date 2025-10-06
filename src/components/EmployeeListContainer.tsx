// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeListContainer.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import EmployeeEditDrawer from './EmployeeEditDrawer';
import { Employee, EmployeeStatus, EmployeeFilters, Team } from '../types/employee';

interface EmployeeListContainerProps {
  employees: Employee[];
  onEmployeesChange: (updater: (prev: Employee[]) => Employee[]) => void;
  onOpenQuickAdd: () => void;
  focusEmployeeId: string | null;
}

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Активен',
  vacation: 'В отпуске',
  probation: 'Испытательный',
  inactive: 'Неактивен',
  terminated: 'Уволен',
};

const STATUS_BADGE_CLASSES: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-800',
  vacation: 'bg-yellow-100 text-yellow-800',
  probation: 'bg-blue-100 text-blue-800',
  inactive: 'bg-gray-100 text-gray-800',
  terminated: 'bg-red-100 text-red-800',
};

const COLUMN_ORDER = [
  { key: 'fio', label: 'Ф.И.О.' },
  { key: 'position', label: 'Должность' },
  { key: 'orgUnit', label: 'Точка оргструктуры' },
  { key: 'team', label: 'Команда' },
  { key: 'scheme', label: 'Схема работы' },
  { key: 'hourNorm', label: 'Норма часов' },
  { key: 'status', label: 'Статус' },
  { key: 'hireDate', label: 'Дата найма' },
] as const;

type ColumnKey = typeof COLUMN_ORDER[number]['key'];

const COLUMN_STORAGE_KEY = 'employee-list:columns';
const FILTER_STORAGE_KEY = 'employee-list:filters';

const createDefaultFilters = (): EmployeeFilters => ({
  search: '',
  team: '',
  status: '',
  skill: '',
  position: '',
  orgUnit: '',
  sortBy: 'name',
  sortOrder: 'asc',
  showInactive: false,
});

const TAG_COLOR_PALETTE = ['#2563eb', '#1d4ed8', '#0ea5e9', '#0f766e', '#16a34a', '#d97706', '#db2777', '#7c3aed'];

const getColorForTag = (tag: string) => {
  let hash = 0;
  for (let index = 0; index < tag.length; index += 1) {
    hash = (hash << 5) - hash + tag.charCodeAt(index);
    hash |= 0;
  }
  const paletteIndex = Math.abs(hash) % TAG_COLOR_PALETTE.length;
  return TAG_COLOR_PALETTE[paletteIndex];
};

const IMPORT_OPTIONS = [
  { id: 'employees', label: 'Сотрудника' },
  { id: 'skills', label: 'Навыки' },
  { id: 'vacations', label: 'Отпуска' },
  { id: 'preferences', label: 'Смены предпочтений' },
  { id: 'schemes', label: 'Схемы' },
  { id: 'tags', label: 'Теги' },
];

const EXPORT_OPTIONS = [
  { id: 'csv', label: 'CSV (текущие колонки)' },
  { id: 'xlsx', label: 'XLSX (макет)' },
];

const EmployeeListContainer: React.FC<EmployeeListContainerProps> = ({
  employees,
  onEmployeesChange,
  onOpenQuickAdd,
  focusEmployeeId,
}) => {
  const [filters, setFilters] = useState<EmployeeFilters>(createDefaultFilters());
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [tagCreationError, setTagCreationError] = useState<string | null>(null);
  const [tagCatalog, setTagCatalog] = useState<Record<string, string>>({});
  const [selectedTagNames, setSelectedTagNames] = useState<Set<string>>(new Set());
  const [tagsMarkedForRemoval, setTagsMarkedForRemoval] = useState<Set<string>>(new Set());
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>(TAG_COLOR_PALETTE[0]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkEditStatus, setBulkEditStatus] = useState<EmployeeStatus | ''>('');
  const [bulkEditTeamId, setBulkEditTeamId] = useState('');
  const [bulkEditComment, setBulkEditComment] = useState('');
  const [bulkEditError, setBulkEditError] = useState<string | null>(null);
  const [bulkEditSuccess, setBulkEditSuccess] = useState<string | null>(null);
  const [importContext, setImportContext] = useState<string>('Сотрудника');
  const [exportContext, setExportContext] = useState<string>('CSV (текущие колонки)');
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const importMenuAnchorRef = useRef<HTMLDivElement | null>(null);
  const exportMenuAnchorRef = useRef<HTMLDivElement | null>(null);
  const toolbarButtonClass = (disabled = false) =>
    `inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      disabled
        ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
    }`;
  const toolbarPrimaryButtonClass =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500 bg-blue-600 text-white text-sm font-medium transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKey, boolean>>({
    fio: true,
    position: true,
    orgUnit: true,
    team: true,
    scheme: true,
    hourNorm: true,
    status: true,
    hireDate: true,
  });

  // Load persisted column visibility
  useEffect(() => {
    const saved = localStorage.getItem(COLUMN_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setColumnVisibility((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn('Failed to parse saved column visibility', err);
      }
    }
  }, []);

  // Persist column visibility
  useEffect(() => {
    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);

  // Load persisted filters
  useEffect(() => {
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn('Failed to parse saved filters', err);
      }
    }
  }, []);

  // Persist filters
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (employees.length === 0) {
      return;
    }
    const timeout = window.setTimeout(() => setIsInitialLoading(false), 250);
    return () => window.clearTimeout(timeout);
  }, [employees.length]);

  useEffect(() => {
    if (!showImportMenu && !showExportMenu) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        showImportMenu &&
        importMenuAnchorRef.current &&
        !importMenuAnchorRef.current.contains(event.target as Node)
      ) {
        setShowImportMenu(false);
      }
      if (
        showExportMenu &&
        exportMenuAnchorRef.current &&
        !exportMenuAnchorRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showImportMenu, showExportMenu]);

  // Sync selection state
  useEffect(() => {
    setShowBulkActions(selectedEmployees.size > 0);
  }, [selectedEmployees]);

  useEffect(() => {
    setSelectedEmployees((prev) => {
      const next = new Set<string>();
      employees.forEach((emp) => {
        if (prev.has(emp.id)) {
          next.add(emp.id);
        }
      });
      return next;
    });
  }, [employees]);

  useEffect(() => {
    if (!focusEmployeeId) {
      return;
    }
    const isPresent = employees.some((emp) => emp.id === focusEmployeeId);
    if (!isPresent) {
      return;
    }
    setActiveEmployeeId(focusEmployeeId);
    setIsDrawerLoading(true);
  }, [focusEmployeeId, employees]);

  useEffect(() => {
    if (!bulkEditSuccess) {
      return;
    }
    const timeout = window.setTimeout(() => setBulkEditSuccess(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [bulkEditSuccess]);

  useEffect(() => {
    if (!showTagManager) {
      setTagError(null);
      setTagCreationError(null);
      setTagsMarkedForRemoval(new Set());
      return;
    }

    const catalog: Record<string, string> = {};
    employees.forEach((emp) => {
      emp.tags.forEach((tag) => {
        if (!catalog[tag]) {
          catalog[tag] = getColorForTag(tag);
        }
      });
    });
    setTagCatalog(catalog);

    const selectedList = employees.filter((emp) => selectedEmployees.has(emp.id));
    if (selectedList.length > 0) {
      const [first, ...rest] = selectedList;
      const commonTags = first.tags.filter((tag) => rest.every((emp) => emp.tags.includes(tag)));
      setSelectedTagNames(new Set(commonTags));
    } else {
      setSelectedTagNames(new Set());
    }

    setTagsMarkedForRemoval(new Set());
    setNewTagName('');
    setNewTagColor(TAG_COLOR_PALETTE[0]);
    setTagCreationError(null);
    setTagError(null);
  }, [showTagManager, employees, selectedEmployees]);

  const handleFilterChange = <K extends keyof EmployeeFilters>(key: K, value: EmployeeFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(createDefaultFilters());
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (!filters.showInactive && employee.status === 'terminated') {
        return false;
      }

      const search = filters.search.trim().toLowerCase();
      if (search) {
        const target = [
          employee.personalInfo.lastName,
          employee.personalInfo.firstName,
          employee.personalInfo.middleName ?? '',
          employee.credentials.wfmLogin,
          employee.workInfo.position,
        ]
          .join(' ')
          .toLowerCase();
        if (!target.includes(search)) {
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

      return true;
    });
  }, [employees, filters]);

  const sortedEmployees = useMemo(() => {
    const data = [...filteredEmployees];
    data.sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

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
          aValue = `${a.personalInfo.lastName} ${a.personalInfo.firstName}`.trim();
          bValue = `${b.personalInfo.lastName} ${b.personalInfo.firstName}`.trim();
          break;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return filters.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return filters.sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue), 'ru')
        : String(bValue).localeCompare(String(aValue), 'ru');
    });

    return data;
  }, [filteredEmployees, filters.sortBy, filters.sortOrder]);

  const teamOptions = useMemo(() => {
    const map = new Map<string, Team>();
    employees.forEach((emp) => {
      map.set(emp.workInfo.team.id, emp.workInfo.team);
    });
    return Array.from(map.values());
  }, [employees]);

  const teamLookup = useMemo(() => {
    const lookup = new Map<string, Team>();
    teamOptions.forEach((team) => lookup.set(team.id, team));
    return lookup;
  }, [teamOptions]);

  const selectedEmployeeList = useMemo(() => {
    if (selectedEmployees.size === 0) {
      return [] as Employee[];
    }
    return employees.filter((emp) => selectedEmployees.has(emp.id));
  }, [employees, selectedEmployees]);

  const totalCount = employees.length;
  const visibleCount = sortedEmployees.length;

  const activeEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === activeEmployeeId) ?? null;
  }, [employees, activeEmployeeId]);

  useEffect(() => {
    if (!isDrawerLoading) {
      return undefined;
    }
    if (!activeEmployee) {
      setIsDrawerLoading(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setIsDrawerLoading(false), 200);
    return () => window.clearTimeout(timer);
  }, [activeEmployee, isDrawerLoading]);

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetBulkEditState = () => {
    setBulkEditStatus('');
    setBulkEditTeamId('');
    setBulkEditComment('');
  };

  const handleOpenBulkEdit = () => {
    if (selectedEmployees.size === 0) {
      setBulkEditError('Выберите сотрудников, чтобы открыть массовое редактирование');
      setBulkEditSuccess(null);
      return;
    }
    setBulkEditError(null);
    setBulkEditSuccess(null);
    const openDrawer = () => setIsBulkEditOpen(true);
    if (typeof window !== 'undefined') {
      window.setTimeout(openDrawer, 0);
    } else {
      openDrawer();
    }
  };

  const handleBulkEditClose = () => {
    setIsBulkEditOpen(false);
    setBulkEditError(null);
    resetBulkEditState();
  };

  const handleBulkEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedEmployees.size === 0) {
      setBulkEditError('Нет выбранных сотрудников.');
      return;
    }

    if (!bulkEditStatus && !bulkEditTeamId && !bulkEditComment.trim()) {
      setBulkEditError('Укажите изменения для применения: статус, команду или комментарий.');
      return;
    }

    const targetTeam = bulkEditTeamId ? teamLookup.get(bulkEditTeamId) : undefined;
    if (bulkEditTeamId && !targetTeam) {
      setBulkEditError('Не удалось найти выбранную команду.');
      return;
    }

    const comment = bulkEditComment.trim();

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (!selectedEmployees.has(emp.id)) {
          return emp;
        }

        const nextStatus = bulkEditStatus ? bulkEditStatus : emp.status;
        const nextWorkInfo = targetTeam
          ? {
              ...emp.workInfo,
              team: targetTeam,
              department: targetTeam.name,
            }
          : emp.workInfo;

        const taskAccumulator = new Set(emp.tasks ?? []);
        if (comment) {
          taskAccumulator.add(comment);
        }

        return {
          ...emp,
          status: nextStatus,
          workInfo: nextWorkInfo,
          tasks: taskAccumulator.size > 0 ? Array.from(taskAccumulator) : emp.tasks,
          metadata: {
            ...emp.metadata,
            updatedAt: new Date(),
            lastModifiedBy: 'agent',
          },
        };
      })
    );

    setBulkEditSuccess('Изменения применены для выбранных сотрудников.');
    setBulkEditError(null);
    setIsBulkEditOpen(false);
    resetBulkEditState();
    clearSelection();
  };

  const handleSelectAll = () => {
    if (selectedEmployees.size === visibleCount && visibleCount > 0) {
      setSelectedEmployees(new Set());
      return;
    }

    setSelectedEmployees(new Set(sortedEmployees.map((emp) => emp.id)));
  };

  const clearSelection = () => {
    setSelectedEmployees(new Set());
    setTagsMarkedForRemoval(new Set());
    setSelectedTagNames(new Set());
    setBulkEditError(null);
  };

  const handleDrawerClose = () => {
    setActiveEmployeeId(null);
    setIsDrawerLoading(false);
  };

  const handleDrawerSave = (updatedEmployee: Employee) => {
    onEmployeesChange((prev) =>
      prev.map((emp) => (emp.id === updatedEmployee.id ? { ...updatedEmployee } : emp))
    );
    setActiveEmployeeId(updatedEmployee.id);
  };

  const toggleColumn = (key: ColumnKey) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApplyTags = () => {
    if (selectedEmployees.size === 0) {
      setTagError('Выберите сотрудников, чтобы применить теги');
      return;
    }

    if (selectedTagNames.size === 0 && tagsMarkedForRemoval.size === 0) {
      setTagError('Отметьте теги для добавления или удаления у выбранных сотрудников');
      return;
    }

    const tagsToAdd = Array.from(selectedTagNames);
    const removalSet = new Set(tagsMarkedForRemoval);

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (!selectedEmployees.has(emp.id)) {
          return emp;
        }

        const updated = new Set(emp.tags);
        removalSet.forEach((tag) => updated.delete(tag));
        tagsToAdd.forEach((tag) => updated.add(tag));

        return {
          ...emp,
          tags: Array.from(updated),
          metadata: { ...emp.metadata, updatedAt: new Date(), lastModifiedBy: 'agent' },
        };
      })
    );

    setTagError(null);
    setTagsMarkedForRemoval(new Set());
    setSelectedTagNames(new Set());
    setShowTagManager(false);
  };

  const handleCreateTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) {
      setTagCreationError('Введите название тега');
      return;
    }
    if (tagCatalog[trimmed]) {
      setTagCreationError('Такой тег уже существует');
      return;
    }

    setTagCatalog((prev) => ({ ...prev, [trimmed]: newTagColor }));
    setSelectedTagNames((prev) => {
      const next = new Set(prev);
      next.add(trimmed);
      return next;
    });
    setTagsMarkedForRemoval((prev) => {
      const next = new Set(prev);
      next.delete(trimmed);
      return next;
    });
    setNewTagName('');
    setTagCreationError(null);
  };

  const toggleTagSelection = (tag: string) => {
    setSelectedTagNames((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const toggleTagRemoval = (tag: string) => {
    setTagsMarkedForRemoval((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleDeleteTagDefinition = (tag: string) => {
    setTagCatalog((prev) => {
      if (!prev[tag]) {
        return prev;
      }
      const { [tag]: _removed, ...rest } = prev;
      return rest;
    });
    setSelectedTagNames((prev) => {
      const next = new Set(prev);
      next.delete(tag);
      return next;
    });
    setTagsMarkedForRemoval((prev) => {
      const next = new Set(prev);
      next.delete(tag);
      return next;
    });

    onEmployeesChange((prev) =>
      prev.map((emp) => {
        if (!emp.tags.includes(tag)) {
          return emp;
        }
        return {
          ...emp,
          tags: emp.tags.filter((existing) => existing !== tag),
          metadata: { ...emp.metadata, updatedAt: new Date(), lastModifiedBy: 'agent' },
        };
      })
    );
  };

  const handleImportOptionSelect = (label: string) => {
    setImportContext(label);
    setShowImportMenu(false);
    setImportFeedback(null);
    setShowImportModal(true);
  };

  const handleExportOptionSelect = (label: string) => {
    setExportContext(label);
    setShowExportMenu(false);
    setExportFeedback(null);
    setShowExportModal(true);
  };

  const handleImportClick = () => {
    setImportFeedback(null);
    importInputRef.current?.click();
  };

  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFeedback(
        `Файл «${file.name}» принят для раздела «${importContext}». Проверка и загрузка будут реализованы после подключения бэкенда.`
      );
    }
  };

  const handleExport = () => {
    const columns = COLUMN_ORDER.filter((column) => columnVisibility[column.key]);
    const header = columns.map((column) => column.label).join(',');
    const rows = sortedEmployees.map((employee) =>
      columns
        .map((column) => {
          switch (column.key) {
            case 'fio':
              return `"${employee.personalInfo.lastName} ${employee.personalInfo.firstName}"`;
            case 'position':
              return `"${employee.workInfo.position}"`;
            case 'orgUnit':
              return `"${employee.orgPlacement.orgUnit}"`;
            case 'team':
              return `"${employee.workInfo.team.name}"`;
            case 'scheme':
              return `"${employee.orgPlacement.workScheme?.name ?? ''}"`;
            case 'hourNorm':
              return String(employee.orgPlacement.hourNorm);
            case 'status':
              return STATUS_LABELS[employee.status];
            case 'hireDate':
              return employee.workInfo.hireDate.toLocaleDateString('ru-RU');
            default:
              return '';
          }
        })
        .join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const normalizedContext = exportContext.replace(/[^а-яА-Яa-zA-Z0-9]+/g, '-').toLowerCase();
    link.download = `employees_export_${normalizedContext}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExportFeedback(`Экспорт завершен. Раздел: ${exportContext}. Файл сохранен в формате CSV.`);
  };

  const hasActiveFilters = useMemo(() => {
    const { search, team, status, position, orgUnit, showInactive } = filters;
    return (
      Boolean(search) ||
      Boolean(team) ||
      Boolean(status) ||
      Boolean(position) ||
      Boolean(orgUnit) ||
      showInactive
    );
  }, [filters]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void }> = [];
    if (filters.team) {
      chips.push({
        label: `Команда: ${filters.team}`,
        onRemove: () => handleFilterChange('team', ''),
      });
    }
    if (filters.status) {
      chips.push({
        label: `Статус: ${STATUS_LABELS[filters.status as EmployeeStatus]}`,
        onRemove: () => handleFilterChange('status', ''),
      });
    }
    if (filters.position) {
      chips.push({ label: `Должность: ${filters.position}`, onRemove: () => handleFilterChange('position', '') });
    }
    if (filters.orgUnit) {
      chips.push({ label: `Точка: ${filters.orgUnit}`, onRemove: () => handleFilterChange('orgUnit', '') });
    }
    if (filters.showInactive) {
      chips.push({ label: 'Показывать уволенных', onRemove: () => handleFilterChange('showInactive', false) });
    }
    return chips;
  }, [filters]);

  const selectedTags = useMemo(() => {
    const tags = new Set<string>();
    employees.forEach((emp) => {
      if (selectedEmployees.has(emp.id)) {
        emp.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employees, selectedEmployees]);

  return (
    <>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={importInputRef}
        className="sr-only"
        onChange={handleImportChange}
      />

      <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="sr-only" aria-live="polite">
          {selectedEmployees.size > 0
            ? `Выбрано сотрудников: ${selectedEmployees.size}`
            : 'Выбор сотрудников очищен'}
        </div>
        <div className="border-b border-gray-200 p-6 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
              <p className="text-gray-600">
                Актуальный список персонала с ключевыми полями карточки и статусами
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={toolbarButtonClass()}
                aria-label={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                title={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
              >
                <span aria-hidden>{showFilters ? '📑' : '🔍'}</span>
                <span>{showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenBulkEdit}
                disabled={selectedEmployees.size === 0}
                className={toolbarButtonClass(selectedEmployees.size === 0)}
                aria-label="Открыть массовое редактирование"
                title={selectedEmployees.size === 0 ? 'Выберите сотрудников для массового редактирования' : 'Массовое редактирование'}
              >
                <span aria-hidden>🛠️</span>
                <span>Массовое редактирование</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTagError(null);
                  setShowTagManager(true);
                }}
                disabled={selectedEmployees.size === 0}
                className={toolbarButtonClass(selectedEmployees.size === 0)}
                aria-label="Управление тегами"
                title={selectedEmployees.size === 0 ? 'Выберите сотрудников для работы с тегами' : 'Управление тегами'}
              >
                <span aria-hidden>🏷️</span>
                <span>Теги</span>
              </button>
              <div className="relative" ref={importMenuAnchorRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportMenu((prev) => !prev);
                    setShowExportMenu(false);
                  }}
                  className={toolbarButtonClass()}
                  aria-haspopup="true"
                  aria-expanded={showImportMenu}
                  title="Импортировать"
                >
                  <span aria-hidden>⬇️</span>
                  <span>Импорт</span>
                </button>
                {showImportMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {IMPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleImportOptionSelect(option.label)}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={exportMenuAnchorRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu((prev) => !prev);
                    setShowImportMenu(false);
                  }}
                  className={toolbarButtonClass()}
                  aria-haspopup="true"
                  aria-expanded={showExportMenu}
                  title="Экспортировать"
                >
                  <span aria-hidden>⬆️</span>
                  <span>Экспорт</span>
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {EXPORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleExportOptionSelect(option.label)}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowColumnSettings(true)}
                className={toolbarButtonClass()}
                aria-label="Настроить отображение колонок"
                title="Настроить отображение колонок"
              >
                <span aria-hidden>🗂️</span>
                <span>Колонки</span>
              </button>
              <button
                type="button"
                onClick={onOpenQuickAdd}
                className={toolbarPrimaryButtonClass}
                aria-label="Добавить нового сотрудника"
                title="Добавить нового сотрудника"
              >
                <span aria-hidden>➕</span>
                <span>Новый сотрудник</span>
              </button>
            </div>
        </div>

        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-blue-900">
              <span>Выбрано сотрудников: {selectedEmployees.size}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  Экспорт
                </button>
                <button
                  type="button"
                  onClick={() => setShowTagManager(true)}
                  className="px-3 py-1 bg-white border border-blue-200 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  Назначить теги
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

        {bulkEditSuccess && (
          <div className="mx-6 mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
            {bulkEditSuccess}
          </div>
        )}
        {bulkEditError && !isBulkEditOpen && (
          <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {bulkEditError}
          </div>
        )}

        <div className="flex flex-col gap-3">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={filters.showInactive}
                    onChange={(event) => handleFilterChange('showInactive', event.target.checked)}
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

            {activeFilterChips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilterChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="text-blue-600 hover:text-blue-800"
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
                      onChange={(event) => handleFilterChange('search', event.target.value)}
                      placeholder="ФИО, логин, должность"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Команда</label>
                    <select
                      value={filters.team}
                      onChange={(event) => handleFilterChange('team', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Все команды</option>
                      {Array.from(new Map(employees.map((emp) => [emp.workInfo.team.id, emp.workInfo.team])).values()).map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Статус</label>
                    <select
                      value={filters.status}
                      onChange={(event) => handleFilterChange('status', event.target.value as EmployeeStatus | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Все статусы</option>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Должность</label>
                    <input
                      type="text"
                      value={filters.position}
                      onChange={(event) => handleFilterChange('position', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Точка оргструктуры</label>
                    <input
                      type="text"
                      value={filters.orgUnit}
                      onChange={(event) => handleFilterChange('orgUnit', event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Сортировка</label>
                    <select
                      value={filters.sortBy}
                      onChange={(event) => handleFilterChange('sortBy', event.target.value as EmployeeFilters['sortBy'])}
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
                      onChange={(event) => handleFilterChange('sortOrder', event.target.value as EmployeeFilters['sortOrder'])}
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
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={visibleCount > 0 && selectedEmployees.size === visibleCount}
                      onChange={handleSelectAll}
                      aria-label="Выбрать всех сотрудников"
                    />
                  </th>
                  {COLUMN_ORDER.filter((column) => columnVisibility[column.key]).map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        column.key === 'hourNorm' || column.key === 'status' || column.key === 'hireDate'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {sortedEmployees.map((employee) => {
                  const isSelected = selectedEmployees.has(employee.id);

                  const openEmployeeDrawer = () => {
                    setIsDrawerLoading(true);
                    setActiveEmployeeId(employee.id);
                  };

                  const handleRowSelectionToggle = () => {
                    toggleEmployeeSelection(employee.id);
                  };

                  return (
                    <tr
                      key={employee.id}
                      tabIndex={0}
                      onClick={(event) => {
                        const target = event.target as HTMLElement;
                        if (target.closest('input[type="checkbox"]') || target.closest('button')) {
                          return;
                        }
                        handleRowSelectionToggle();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === ' ') {
                          event.preventDefault();
                          handleRowSelectionToggle();
                        }
                      }}
                      className={`transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded text-blue-600 focus:ring-blue-500"
                          checked={isSelected}
                          onChange={(event) => {
                            event.stopPropagation();
                            toggleEmployeeSelection(employee.id);
                          }}
                          aria-label={`Выбрать ${employee.personalInfo.lastName} ${employee.personalInfo.firstName}`}
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
                            <div className="ml-3 space-y-1">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openEmployeeDrawer();
                                }}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                              >
                                {employee.personalInfo.lastName} {employee.personalInfo.firstName}
                              </button>
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
                            />
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
                          {employee.orgPlacement.hourNorm}
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
                          {employee.workInfo.hireDate.toLocaleDateString('ru-RU')}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {isInitialLoading && (
          <div className="absolute inset-0 z-20 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-transparent rounded-full animate-spin" />
            <div className="w-full max-w-4xl space-y-3 px-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`loader-row-${index}`}
                  className="h-11 rounded-lg bg-gray-200/80 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {isBulkEditOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={handleBulkEditClose}>
          <div
            className="ml-auto h-full w-full max-w-xl bg-white shadow-xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <form className="flex flex-col h-full" onSubmit={handleBulkEditSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Редактирование данных сотрудников</h3>
                  <p className="text-sm text-gray-500">
                    Выбрано: {selectedEmployees.size}{' '}
                    {selectedEmployees.size === 1 ? 'сотрудник' : 'сотрудников'}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBulkEditClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Закрыть массовое редактирование"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {bulkEditError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                    {bulkEditError}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-medium text-gray-500 mb-1" htmlFor="bulk-edit-status">Новый статус</label>
                    <select
                      id="bulk-edit-status"
                      value={bulkEditStatus}
                      onChange={(event) => setBulkEditStatus(event.target.value as EmployeeStatus | '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Оставить без изменений</option>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium text-gray-500 mb-1" htmlFor="bulk-edit-team">Команда</label>
                    <select
                      id="bulk-edit-team"
                      value={bulkEditTeamId}
                      onChange={(event) => setBulkEditTeamId(event.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Оставить текущую команду</option>
                      {teamOptions.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-medium text-gray-500 mb-1" htmlFor="bulk-edit-comment">Комментарий / задача</label>
                    <textarea
                      id="bulk-edit-comment"
                      value={bulkEditComment}
                      onChange={(event) => setBulkEditComment(event.target.value)}
                      className="w-full min-h-[72px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: Обновить профиль сотрудника"
                    />
                    <p className="mt-1 text-xs text-gray-400">Комментарий добавится в список задач выбранных сотрудников.</p>
                  </div>
                </div>

                {selectedEmployeeList.length > 0 && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <p className="font-medium text-gray-900 mb-2">Выбранные сотрудники</p>
                    <ul className="space-y-1 max-h-36 overflow-y-auto">
                      {selectedEmployeeList.slice(0, 8).map((emp) => (
                        <li key={emp.id} className="flex items-center justify-between gap-3">
                          <span>{emp.personalInfo.lastName} {emp.personalInfo.firstName}</span>
                          <span className="text-xs text-gray-500">{emp.workInfo.team.name}</span>
                        </li>
                      ))}
                      {selectedEmployeeList.length > 8 && (
                        <li className="text-xs text-gray-500">и ещё {selectedEmployeeList.length - 8}…</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleBulkEditClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Применить изменения
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Column settings drawer */}
      {showColumnSettings && (
        <div className="fixed inset-0 z-40 bg-black/40 flex" onClick={() => setShowColumnSettings(false)}>
          <div
            className="ml-auto h-full w-full max-w-sm bg-white shadow-xl flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowColumnSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Вернуться к списку сотрудников"
                >
                  ←
                </button>
                <h3 className="text-base font-semibold text-gray-900">Настройка отображения</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowColumnSettings(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть настройки отображения"
              >
                ✕
              </button>
            </div>
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-500">Выберите поля для отображения в таблице сотрудников.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {COLUMN_ORDER.map((column) => (
                <label key={column.key} className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500"
                    checked={columnVisibility[column.key]}
                    onChange={() => toggleColumn(column.key)}
                  />
                  <span>{column.label}</span>
                </label>
              ))}
              <button
                type="button"
                onClick={() =>
                  setColumnVisibility({
                    fio: true,
                    position: true,
                    orgUnit: true,
                    team: true,
                    scheme: true,
                    hourNorm: true,
                    status: true,
                    hireDate: true,
                  })
                }
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

      {/* Tag manager */}
      {showTagManager && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setShowTagManager(false)}>
          <div
            className="bg-white rounded-xl max-w-lg w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Управление тегами</h3>
                <p className="text-sm text-gray-500">См. Appendix 6 — Tag Import Template</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTagManager(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть управление тегами"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-5">
              <p className="text-sm text-gray-600">
                Выбрано сотрудников: <span className="font-medium">{selectedEmployees.size}</span>. Выберите теги для назначения или удаления у этих сотрудников.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название тега</label>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(event) => {
                      setNewTagName(event.target.value);
                      if (tagCreationError) {
                        setTagCreationError(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Например: VIP"
                  />
                </div>
                <div>
                  <span className="block text-xs uppercase font-semibold text-gray-500 mb-2">Цвет</span>
                  <div className="flex flex-wrap gap-2">
                    {TAG_COLOR_PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTagColor(color)}
                        className={`w-7 h-7 rounded-full border transition-shadow ${
                          newTagColor === color ? 'border-blue-600 ring-2 ring-blue-300' : 'border-transparent hover:ring-2 hover:ring-blue-200'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Выбрать цвет ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Создать тег
                  </button>
                  {tagCreationError && <span className="text-xs text-red-600">{tagCreationError}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Доступные теги</p>
                <div className="max-h-64 overflow-auto space-y-2">
                  {Object.entries(tagCatalog).length === 0 ? (
                    <p className="text-sm text-gray-500">Пока нет тегов — создайте новый, чтобы назначить сотрудникам.</p>
                  ) : (
                    Object.entries(tagCatalog).map(([tag, color]) => {
                      const assigned = selectedTagNames.has(tag);
                      const marked = tagsMarkedForRemoval.has(tag);
                      return (
                        <div
                          key={tag}
                          className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                        >
                          <label className="flex items-center gap-3 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="rounded text-blue-600 focus:ring-blue-500"
                              checked={assigned}
                              onChange={() => {
                                toggleTagSelection(tag);
                                if (tagError) {
                                  setTagError(null);
                                }
                              }}
                            />
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block w-4 h-4 rounded-sm border border-gray-300"
                                style={{ backgroundColor: color }}
                              />
                              {tag}
                            </span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleTagRemoval(tag)}
                              className={`text-xs font-medium transition-colors ${
                                marked ? 'text-red-600' : 'text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {marked ? 'Отменить удаление' : 'Удалить у выбранных'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTagDefinition(tag)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label={`Удалить тег ${tag}`}
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {tagsMarkedForRemoval.size > 0 && (
                  <p className="text-xs text-red-600">
                    К удалению у выбранных сотрудников отмечено: {tagsMarkedForRemoval.size}
                  </p>
                )}
              </div>

              {selectedTags.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-700">У выбранных сотрудников уже есть</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => {
                      const swatch = tagCatalog[tag] ?? getColorForTag(tag);
                      return (
                        <span
                          key={`selected-${tag}`}
                          className="px-2 py-1 rounded-full border border-gray-200 text-xs font-medium"
                          style={{ backgroundColor: `${swatch}20`, color: '#1f2937' }}
                        >
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {tagError && <p className="text-xs text-red-600">{tagError}</p>}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">Подсказка</p>
                <p>• Указывайте краткие теги (направление, уровень навыков, график).</p>
                <p>• Отметьте флажком те теги, которые нужно добавить выбранным сотрудникам.</p>
                <p>• Кнопка «Удалить у выбранных» позволит быстро снять теги у выделенной группы.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowTagManager(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleApplyTags}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Применить изменения
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setShowImportModal(false)}>
          <div
            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Импорт сотрудников</h3>
                <p className="text-sm text-gray-500">Шаблоны: Appendix 1/3/4/8</p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть импорт"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p className="text-gray-500">Выбран раздел: <span className="font-medium text-gray-700">{importContext}</span></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Скачайте и заполните шаблон (Appendix 1 — сотрудники, Appendix 3 — навыки, Appendix 4 — активности, Appendix 8 — схемы).</li>
                <li>Проверьте форматы дат и соответствие справочникам системы.</li>
                <li>Загрузите файл: предварительная проверка выполнится на фронте, итоговая загрузка — после подключения бэкенда.</li>
              </ol>
              <button
                type="button"
                onClick={handleImportClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Выбрать файл
              </button>
              {importFeedback && <p className="text-sm text-blue-700">{importFeedback}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Export modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center" onClick={() => setShowExportModal(false)}>
          <div
            className="bg-white rounded-xl max-w-xl w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-б border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Экспорт списка сотрудников</h3>
                <p className="text-sm text-gray-500">Учёт активных колонок и фильтров</p>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Закрыть экспорт"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-gray-700">
              <p className="text-gray-500">Формат: <span className="font-medium text-gray-700">{exportContext}</span></p>
              <p>
                Экспорт формирует CSV-файл в соответствии с выбранными колонками и активными фильтрами.
                Формат соответствует Appendix 1, чтобы можно было исправить данные и загрузить обратно.
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Скачать CSV
              </button>
              {exportFeedback && <p className="text-sm text-blue-700">{exportFeedback}</p>}
            </div>
          </div>
        </div>
      )}

      <EmployeeEditDrawer
        employee={activeEmployee}
        isOpen={Boolean(activeEmployee)}
        mode="edit"
        isLoading={isDrawerLoading}
        onClose={handleDrawerClose}
        onSave={handleDrawerSave}
      />
    </>
  );
};

export default EmployeeListContainer;
