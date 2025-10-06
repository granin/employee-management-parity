// /Users/m/git/client/naumen/employee-management/src/components/QuickAddEmployee.tsx

import React, { useMemo, useState, useEffect } from 'react';
import { Employee, Team } from '../types/employee';

const TOTAL_STEPS = 4;

interface QuickAddEmployeeProps {
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'metadata'>) => void;
  onSuccess?: () => void;
}

interface QuickFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  position: string;
  teamId: string;
  manager: string;
  startDate: string;
  wfmLogin: string;
  externalLogins: string;
  password: string;
  orgUnit: string;
  office: string;
  timeZone: string;
  hourNorm: string;
  scheme: string;
  skills: string;
  tags: string;
}

const createInitialForm = (): QuickFormData => ({
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  phone: '',
  position: '',
  teamId: '',
  manager: '',
  startDate: new Date().toISOString().split('T')[0],
  wfmLogin: '',
  externalLogins: '',
  password: '',
  orgUnit: '',
  office: '',
  timeZone: 'Europe/Moscow',
  hourNorm: '40',
  scheme: 'Административный график',
  skills: '',
  tags: ''
});

const QuickAddEmployee: React.FC<QuickAddEmployeeProps> = ({
  teams,
  isOpen,
  onClose,
  onSubmit,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<QuickFormData>(createInitialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof QuickFormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData(createInitialForm());
      setErrors({});
    }
  }, [isOpen]);

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof QuickFormData, string>> = {};

    if (stepNumber === 1) {
      if (!formData.lastName.trim()) newErrors.lastName = 'Обязательное поле';
      if (!formData.firstName.trim()) newErrors.firstName = 'Обязательное поле';
      if (!formData.middleName.trim()) newErrors.middleName = 'Обязательное поле';
      if (!formData.email.trim()) {
        newErrors.email = 'Обязательное поле';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Неверный формат email';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Обязательное поле';
    }

    if (stepNumber === 2) {
      if (!formData.wfmLogin.trim()) newErrors.wfmLogin = 'Обязательное поле';
      if (!formData.externalLogins.trim()) newErrors.externalLogins = 'Укажите минимум один логин';
      if (formData.password && formData.password.trim().length < 6) {
        newErrors.password = 'Минимум 6 символов';
      }
    }

    if (stepNumber === 3) {
      if (!formData.position.trim()) newErrors.position = 'Обязательное поле';
      if (!formData.teamId) newErrors.teamId = 'Выберите команду';
      if (!formData.manager.trim()) newErrors.manager = 'Обязательное поле';
      if (!formData.startDate) newErrors.startDate = 'Укажите дату';
      if (!formData.orgUnit.trim()) newErrors.orgUnit = 'Обязательное поле';
      if (!formData.office.trim()) newErrors.office = 'Обязательное поле';
      if (!formData.timeZone.trim()) newErrors.timeZone = 'Обязательное поле';
      if (!formData.hourNorm.trim()) {
        newErrors.hourNorm = 'Укажите норму часов';
      } else if (Number(formData.hourNorm) <= 0) {
        newErrors.hourNorm = 'Значение должно быть больше нуля';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof QuickFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const buildSkills = (rawSkills: string, assessor: string) => {
    const entries = rawSkills
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);

    return entries.map((name, index) => ({
      id: `quick_skill_${Date.now()}_${index}`,
      name,
      category: 'communication' as const,
      level: 3,
      verified: false,
      lastAssessed: new Date(),
      assessor: assessor || 'Менеджер',
      certificationRequired: false,
      priority: index + 1
    }));
  };

  const handleSubmit = async () => {
    if (!validateStep(TOTAL_STEPS)) return;

    setIsSubmitting(true);

    try {
      const selectedTeam = teams.find(t => t.id === formData.teamId);
      if (!selectedTeam) {
        throw new Error('Команда не найдена');
      }

      const employeeId = `EMP${Date.now().toString().slice(-4)}`;
      const fallbackLogin = formData.email ? formData.email.split('@')[0] : `user${Date.now().toString().slice(-4)}`;
      const externalLogins = formData.externalLogins
        .split(',')
        .map(login => login.trim())
        .filter(Boolean);
      const parsedTags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      const parsedSkills = buildSkills(formData.skills, formData.manager);
      const hourNormValue = Number(formData.hourNorm) || 40;

      const newEmployee: Omit<Employee, 'id' | 'metadata'> = {
        employeeId,
        status: 'probation',
        personalInfo: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          middleName: formData.middleName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim()
        },
        credentials: {
          wfmLogin: formData.wfmLogin.trim() || fallbackLogin,
          externalLogins,
          passwordSet: Boolean(formData.password.trim()),
          passwordLastUpdated: formData.password.trim() ? new Date() : undefined
        },
        workInfo: {
          position: formData.position.trim(),
          team: selectedTeam,
          manager: formData.manager.trim(),
          hireDate: new Date(formData.startDate),
          contractType: 'full-time',
          workLocation: formData.office.trim() || 'Офис',
          department: selectedTeam.name.includes('поддержки')
            ? 'Клиентская поддержка'
            : selectedTeam.name.includes('продаж')
              ? 'Продажи'
              : 'Общий'
        },
        orgPlacement: {
          orgUnit: formData.orgUnit.trim() || selectedTeam.name,
          office: formData.office.trim() || 'Офис',
          timeZone: formData.timeZone.trim() || 'Europe/Moscow',
          hourNorm: hourNormValue,
          workScheme: formData.scheme.trim()
            ? {
                id: `scheme_${Date.now()}`,
                name: formData.scheme.trim(),
                effectiveFrom: new Date()
              }
            : undefined
        },
        skills: parsedSkills,
        reserveSkills: [],
        tags: parsedTags,
        preferences: {
          preferredShifts: ['day'],
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
            start: '09:00',
            end: '18:00'
          }
        },
        performance: {
          averageHandleTime: 0,
          callsPerHour: 0,
          qualityScore: 0,
          adherenceScore: 0,
          customerSatisfaction: 0,
          lastEvaluation: new Date()
        },
        certifications: []
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSubmit(newEmployee);
      setStep(TOTAL_STEPS + 1);

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error creating employee:', error);
      setErrors(prev => ({ ...prev, email: 'Ошибка создания сотрудника. Попробуйте еще раз.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const progressSteps = useMemo(() => Array.from({ length: TOTAL_STEPS }, (_, index) => index + 1), []);
  const currentStep = Math.min(step, TOTAL_STEPS);
  const teamName = teams.find(t => t.id === formData.teamId)?.name ?? '—';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Быстрое добавление сотрудника</h2>
            {step <= TOTAL_STEPS ? (
              <p className="text-sm text-gray-500">Шаг {currentStep} из {TOTAL_STEPS}</p>
            ) : (
              <p className="text-sm text-gray-500">Готово</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {step <= TOTAL_STEPS && (
          <div className="px-6 pt-4">
            <div className="flex items-center">
              {progressSteps.map(stepNumber => (
                <React.Fragment key={stepNumber}>
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
                    `}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < TOTAL_STEPS && (
                    <div
                      className={`flex-1 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-lg font-semibold text-gray-900">Личная информация</h3>
                <p className="text-sm text-gray-600">Основные данные нового сотрудника</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  ['lastName', 'Фамилия'],
                  ['firstName', 'Имя'],
                  ['middleName', 'Отчество']
                ] as Array<[keyof QuickFormData, string]>).map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                    <input
                      type="text"
                      value={formData[field] as string}
                      onChange={event => handleInputChange(field, event.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[field] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={label}
                    />
                    {errors[field] && (
                      <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={event => handleInputChange('email', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@company.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={event => handleInputChange('phone', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+996 555 123 456"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🔐</div>
                <h3 className="text-lg font-semibold text-gray-900">Учетные данные</h3>
                <p className="text-sm text-gray-600">Настройка логинов и пароля</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Логин WFM *</label>
                  <input
                    type="text"
                    value={formData.wfmLogin}
                    onChange={event => handleInputChange('wfmLogin', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.wfmLogin ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ivanov.ii"
                  />
                  {errors.wfmLogin && (
                    <p className="mt-1 text-xs text-red-600">{errors.wfmLogin}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Внешние логины *</label>
                  <input
                    type="text"
                    value={formData.externalLogins}
                    onChange={event => handleInputChange('externalLogins', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.externalLogins ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Логин CRM, Логин телефонии"
                  />
                  <p className="mt-1 text-xs text-gray-500">Введите значения через запятую</p>
                  {errors.externalLogins && (
                    <p className="mt-1 text-xs text-red-600">{errors.externalLogins}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Временный пароль</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={event => handleInputChange('password', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Оставьте пустым, чтобы сгенерировать автоматически"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🏢</div>
                <h3 className="text-lg font-semibold text-gray-900">Организационные данные</h3>
                <p className="text-sm text-gray-600">Позиция, команда и рабочие параметры</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Должность *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={event => handleInputChange('position', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.position ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Старший оператор"
                  />
                  {errors.position && (
                    <p className="mt-1 text-xs text-red-600">{errors.position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Команда *</label>
                  <select
                    value={formData.teamId}
                    onChange={event => handleInputChange('teamId', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.teamId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Выберите команду</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.memberCount} чел.)
                      </option>
                    ))}
                  </select>
                  {errors.teamId && (
                    <p className="mt-1 text-xs text-red-600">{errors.teamId}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Менеджер *</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={event => handleInputChange('manager', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.manager ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.manager && (
                    <p className="mt-1 text-xs text-red-600">{errors.manager}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала работы *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={event => handleInputChange('startDate', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Точка оргструктуры *</label>
                  <input
                    type="text"
                    value={formData.orgUnit}
                    onChange={event => handleInputChange('orgUnit', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.orgUnit ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Отдел качества"
                  />
                  {errors.orgUnit && (
                    <p className="mt-1 text-xs text-red-600">{errors.orgUnit}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Офис *</label>
                  <input
                    type="text"
                    value={formData.office}
                    onChange={event => handleInputChange('office', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.office ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Офис Бишкек"
                  />
                  {errors.office && (
                    <p className="mt-1 text-xs text-red-600">{errors.office}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Часовой пояс *</label>
                  <input
                    type="text"
                    value={formData.timeZone}
                    onChange={event => handleInputChange('timeZone', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.timeZone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.timeZone && (
                    <p className="mt-1 text-xs text-red-600">{errors.timeZone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Норма часов *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.hourNorm}
                    onChange={event => handleInputChange('hourNorm', event.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.hourNorm ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="40"
                  />
                  {errors.hourNorm && (
                    <p className="mt-1 text-xs text-red-600">{errors.hourNorm}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🧩</div>
                <h3 className="text-lg font-semibold text-gray-900">Дополнительные параметры</h3>
                <p className="text-sm text-gray-600">Схема, навыки и сводка перед созданием</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Схема работы</label>
                  <input
                    type="text"
                    value={formData.scheme}
                    onChange={event => handleInputChange('scheme', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Теги</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={event => handleInputChange('tags', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Плавающий, Норма"
                  />
                  <p className="mt-1 text-xs text-gray-500">Через запятую</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Навыки</label>
                  <textarea
                    value={formData.skills}
                    onChange={event => handleInputChange('skills', event.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Консультирование клиентов, CRM"
                  />
                  <p className="mt-1 text-xs text-gray-500">Через запятую, при необходимости можно оставить пустым</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-900 space-y-1">
                <p className="font-semibold">Сводка перед созданием</p>
                <p><span className="font-medium">ФИО:</span> {formData.lastName} {formData.firstName} {formData.middleName}</p>
                <p><span className="font-medium">Должность:</span> {formData.position}</p>
                <p><span className="font-medium">Команда:</span> {teamName}</p>
                <p><span className="font-medium">Логин WFM:</span> {formData.wfmLogin || 'будет сгенерирован'}</p>
                <p><span className="font-medium">Точка оргструктуры:</span> {formData.orgUnit || teamName}</p>
                <p><span className="font-medium">Норма часов:</span> {formData.hourNorm || '40'} ч</p>
                <p><span className="font-medium">Схема:</span> {formData.scheme || '—'}</p>
              </div>
            </div>
          )}

          {step === TOTAL_STEPS + 1 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Сотрудник добавлен!</h3>
              <p className="text-gray-600 mb-4">
                {formData.firstName} {formData.lastName} успешно добавлен в систему
              </p>
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Что дальше:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Добавить фото профиля</li>
                  <li>• Настроить навыки и уровни</li>
                  <li>• Создать расписание работы</li>
                  <li>• Отправить приглашение в систему</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {step <= TOTAL_STEPS && (
          <div className="border-t border-gray-200 p-6">
            <div className="flex justify-between">
              <button
                onClick={step === 1 ? onClose : handlePrevious}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {step === 1 ? 'Отмена' : 'Назад'}
              </button>

              <button
                onClick={step === TOTAL_STEPS ? handleSubmit : handleNext}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && step === TOTAL_STEPS && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {step === TOTAL_STEPS ? (isSubmitting ? 'Создание...' : 'Создать сотрудника') : 'Далее'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickAddEmployee;
