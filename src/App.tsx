// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/App.tsx

import React, { useEffect, useState } from 'react';
import EmployeeListContainer from './components/EmployeeListContainer';
import EmployeePhotoGallery from './components/EmployeePhotoGallery';
import PerformanceMetricsView from './components/PerformanceMetricsView';
import QuickAddEmployee from './components/QuickAddEmployee';
import EmployeeStatusManager from './components/EmployeeStatusManager';
import CertificationTracker from './components/CertificationTracker';
import { Employee, Team } from './types/employee';
import './index.css';

const App: React.FC = () => {
  const initialEmployees: Employee[] = [
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
          category: 'communication',
          level: 5,
          verified: true,
          lastAssessed: new Date('2024-01-15'),
          assessor: 'Иванов И.И.',
          certificationRequired: false,
          priority: 1
        },
        {
          id: 's2',
          name: 'CRM система',
          category: 'technical',
          level: 4,
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
          category: 'product',
          level: 3,
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

  const [employeesState] = useState<Employee[]>(initialEmployees);
  const teams: Team[] = [employeesState[0].workInfo.team];
  const [currentView, setCurrentView] = useState<string>('list');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    if (currentView === 'quickAdd') {
      setIsQuickAddOpen(true);
    }
  }, [currentView]);

  // Simplified component list for testing
  const views = [
    { id: 'list', label: 'Список сотрудников', icon: '📋' },
    { id: 'gallery', label: 'Фото галерея', icon: '🖼️' },
    { id: 'performance', label: 'Показатели', icon: '📈' },
    { id: 'quickAdd', label: 'Быстрое добавление', icon: '⚡' },
    { id: 'statusManager', label: 'Статусы', icon: '✅' },
    { id: 'certifications', label: 'Сертификации', icon: '🎓' },
    { id: 'skills', label: 'Навыки', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WFM</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Управление сотрудниками - 1010.ru
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1">
            {views.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-blue-50 border-b border-blue-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-sm text-blue-800">
            <strong>Текущий раздел:</strong> {views.find(v => v.id === currentView)?.label}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && <EmployeeListContainer />}
        {currentView === 'gallery' && (
          <EmployeePhotoGallery employees={employeesState} teams={teams} />
        )}
        {currentView === 'performance' && (
          <PerformanceMetricsView employees={employeesState} />
        )}
        {currentView === 'quickAdd' && isQuickAddOpen && (
          <div className="max-w-2xl mx-auto">
            <QuickAddEmployee
              teams={teams}
              isOpen={isQuickAddOpen}
              onClose={() => {
                setIsQuickAddOpen(false);
                setCurrentView('list');
              }}
              onSubmit={() => {}}
            />
          </div>
        )}
        {currentView === 'statusManager' && (
          <EmployeeStatusManager employees={employeesState} />
        )}
        {currentView === 'certifications' && (
          <CertificationTracker employees={employeesState} />
        )}
        {currentView === 'skills' && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Навыки</h3>
            <p className="text-gray-500">Компонент управления навыками в разработке</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
