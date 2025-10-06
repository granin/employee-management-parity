import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EmployeeListContainer from './components/EmployeeListContainer';
import EmployeePhotoGallery from './components/EmployeePhotoGallery';
import PerformanceMetricsView from './components/PerformanceMetricsView';
import QuickAddEmployee from './components/QuickAddEmployee';
import EmployeeStatusManager from './components/EmployeeStatusManager';
import CertificationTracker from './components/CertificationTracker';
import { Employee, Team } from './types/employee';
import './index.css';

const TEAM_PRESETS: Record<string, Team> = {
  support: {
    id: 'team_support',
    name: 'Группа поддержки',
    description: 'Первая линия поддержки клиентов 1010.ru',
    color: '#2563eb',
    managerId: 'mgr_support',
    memberCount: 18,
    targetUtilization: 0.85,
  },
  quality: {
    id: 'team_quality',
    name: 'Отдел качества',
    description: 'Контроль обращений и коучинг операторов',
    color: '#9333ea',
    managerId: 'mgr_quality',
    memberCount: 9,
    targetUtilization: 0.8,
  },
  sales: {
    id: 'team_sales',
    name: 'Продажи B2B',
    description: 'Работа с корпоративными клиентами',
    color: '#f97316',
    managerId: 'mgr_sales',
    memberCount: 14,
    targetUtilization: 0.78,
  },
  operations: {
    id: 'team_operations',
    name: 'Операционный центр',
    description: 'Сменная команда распределения задач',
    color: '#0f766e',
    managerId: 'mgr_ops',
    memberCount: 22,
    targetUtilization: 0.88,
  },
  hr: {
    id: 'team_hr',
    name: 'HR-служба',
    description: 'Подбор, адаптация и развитие персонала',
    color: '#ef4444',
    managerId: 'mgr_hr',
    memberCount: 6,
    targetUtilization: 0.7,
  },
  training: {
    id: 'team_training',
    name: 'Учебный центр',
    description: 'Обучение и сертификация сотрудников',
    color: '#a855f7',
    managerId: 'mgr_training',
    memberCount: 11,
    targetUtilization: 0.75,
  },
};

const INITIAL_EMPLOYEES: Employee[] = [
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
        relationship: 'супруг',
      },
    },
    credentials: {
      wfmLogin: 'd.abdullaeva',
      externalLogins: ['crm', 'telephony'],
      passwordSet: true,
      passwordLastUpdated: new Date('2024-01-05'),
    },
    workInfo: {
      position: 'Старший оператор',
      team: { ...TEAM_PRESETS.support },
      manager: 'Иванов И.И.',
      hireDate: new Date('2021-03-15'),
      contractType: 'full-time',
      salary: 45000,
      workLocation: 'Офис Бишкек',
      department: 'Клиентская поддержка',
    },
    orgPlacement: {
      orgUnit: 'Отдел качества',
      office: 'Офис Бишкек',
      timeZone: 'Europe/Moscow',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-support-day',
        name: 'Административный график',
        effectiveFrom: new Date('2022-03-15'),
      },
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
        priority: 1,
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
        priority: 2,
      },
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
        priority: 3,
      },
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
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '08:00',
          end: '17:00',
        },
        schemePreferences: ['Административный график', 'Удалённый день по пятницам'],
      },
      performance: {
        averageHandleTime: 7.5,
        callsPerHour: 12.5,
        qualityScore: 94,
        adherenceScore: 87,
        customerSatisfaction: 4.8,
        lastEvaluation: new Date('2024-01-30'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2021-03-10'),
        updatedAt: new Date('2024-02-15'),
        createdBy: 'admin_001',
        lastModifiedBy: 'mgr_001',
        lastLogin: new Date('2024-02-14T09:30:00'),
      },
      personnelNumber: 'PN-001',
      actualAddress: 'г. Бишкек, проспект Манаса 12',
      tasks: ['Контроль качества', 'Наставничество новичков'],
    },
  {
    id: 'emp_002',
    employeeId: 'EMP002',
    status: 'vacation',
    personalInfo: {
      firstName: 'Айгуль',
      lastName: 'Мусаева',
      middleName: 'Жанатовна',
      email: 'a.musaeva@company.com',
      phone: '+996700112299',
      photo: 'https://i.pravatar.cc/150?img=5',
      address: 'г. Бишкек, ул. Киевская 88',
      emergencyContact: {
        name: 'Данияр Мусаев',
        phone: '+996700113355',
        relationship: 'брат',
      },
    },
    credentials: {
      wfmLogin: 'a.musaeva',
      externalLogins: ['quality', 'crm'],
      passwordSet: true,
      passwordLastUpdated: new Date('2023-12-20'),
    },
    workInfo: {
      position: 'Специалист по контролю качества',
      team: { ...TEAM_PRESETS.quality },
      manager: 'Горбунов П.С.',
      hireDate: new Date('2019-06-01'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'Контроль качества',
    },
    orgPlacement: {
      orgUnit: 'Служба качества',
      office: 'Офис Бишкек',
      timeZone: 'Asia/Bishkek',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-quality-flex',
        name: 'Гибкий график',
        effectiveFrom: new Date('2021-01-05'),
      },
    },
    skills: [
      {
        id: 's4',
        name: 'Оценка звонков',
        category: 'communication',
        level: 5,
        verified: true,
        lastAssessed: new Date('2024-02-10'),
        assessor: 'Горбунов П.С.',
        certificationRequired: false,
      },
      {
        id: 's5',
        name: 'Аналитика обращений',
        category: 'technical',
        level: 4,
        verified: true,
        lastAssessed: new Date('2023-11-14'),
        assessor: 'Горбунов П.С.',
        certificationRequired: false,
      },
    ],
    reserveSkills: [],
    tags: ['Контроль качества', 'Коучинг'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: false,
          push: true,
          scheduleChanges: true,
          announcements: true,
          reminders: false,
        },
        language: 'ru',
        workingHours: {
          start: '10:00',
          end: '19:00',
        },
        schemePreferences: ['Гибкий график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 97,
        adherenceScore: 92,
        customerSatisfaction: 4.9,
        lastEvaluation: new Date('2024-02-05'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2019-05-20'),
        updatedAt: new Date('2024-01-18'),
        createdBy: 'admin_002',
        lastModifiedBy: 'mgr_quality',
        lastLogin: new Date('2024-01-25T12:45:00'),
      },
      personnelNumber: 'PN-002',
      actualAddress: 'г. Бишкек, ул. Киевская 88',
      tasks: ['Аудит звонков', 'Подготовка аналитических отчётов'],
    },
  {
    id: 'emp_003',
    employeeId: 'EMP003',
    status: 'probation',
    personalInfo: {
      firstName: 'Руслан',
      lastName: 'Ахметов',
      middleName: 'Арсенович',
      email: 'ruslan.akhmetov@company.com',
      phone: '+996770445566',
      photo: 'https://i.pravatar.cc/150?img=11',
      address: 'г. Бишкек, ул. Фрунзе 45',
    },
    credentials: {
      wfmLogin: 'r.akhmetov',
      externalLogins: ['crm'],
      passwordSet: false,
    },
    workInfo: {
      position: 'Оператор первого уровня',
      team: { ...TEAM_PRESETS.support },
      manager: 'Иванов И.И.',
      hireDate: new Date('2024-08-12'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'Клиентская поддержка',
    },
    orgPlacement: {
      orgUnit: 'Линия поддержки',
      office: 'Офис Бишкек',
      timeZone: 'Europe/Moscow',
      hourNorm: 36,
      workScheme: {
        id: 'scheme-support-evening',
        name: 'Смешанный график',
        effectiveFrom: new Date('2024-08-01'),
      },
    },
    skills: [
      {
        id: 's6',
        name: 'Обработка чатов',
        category: 'communication',
        level: 3,
        verified: false,
        lastAssessed: new Date('2024-08-20'),
        assessor: 'Иванов И.И.',
        certificationRequired: false,
      },
      {
        id: 's7',
        name: 'Продуктовая база знаний',
        category: 'product',
        level: 2,
        verified: false,
        lastAssessed: new Date('2024-08-20'),
        assessor: 'Наставник линии 1',
        certificationRequired: false,
      },
    ],
    reserveSkills: [],
    tags: ['Новичок', 'Чат'],
      preferences: {
        preferredShifts: ['evening'],
        notifications: {
          email: true,
          sms: true,
          push: true,
          scheduleChanges: true,
          announcements: false,
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '13:00',
          end: '22:00',
        },
        schemePreferences: ['Смешанный график'],
      },
      performance: {
        averageHandleTime: 9.2,
        callsPerHour: 10.1,
        qualityScore: 88,
        adherenceScore: 75,
        customerSatisfaction: 4.3,
        lastEvaluation: new Date('2024-08-25'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2024-08-12'),
        updatedAt: new Date('2024-08-27'),
        createdBy: 'mgr_support',
        lastModifiedBy: 'mentor_01',
    },
    personnelNumber: 'PN-003',
    actualAddress: 'г. Бишкек, ул. Фрунзе 45',
    tasks: ['Обработка чатов', 'Обучение продуктовой базе'],
  },
  {
    id: 'emp_004',
    employeeId: 'EMP004',
    status: 'terminated',
    personalInfo: {
      firstName: 'Полина',
      lastName: 'Чернова',
      middleName: 'Олеговна',
      email: 'p.chernova@company.com',
      phone: '+996555667788',
      photo: 'https://i.pravatar.cc/150?img=14',
      address: 'г. Бишкек, ул. Советская 3',
    },
    credentials: {
      wfmLogin: 'p.chernova',
      externalLogins: ['sales-crm'],
      passwordSet: true,
      passwordLastUpdated: new Date('2023-04-02'),
    },
    workInfo: {
      position: 'Менеджер по продажам B2B',
      team: { ...TEAM_PRESETS.sales },
      manager: 'Семенов М.В.',
      hireDate: new Date('2018-02-10'),
      contractType: 'full-time',
      salary: 78000,
      workLocation: 'Офис Бишкек',
      department: 'Продажи B2B',
    },
    orgPlacement: {
      orgUnit: 'Коммерческий блок',
      office: 'Офис Бишкек',
      timeZone: 'Europe/Moscow',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-sales-field',
        name: 'Плавающий график',
        effectiveFrom: new Date('2020-01-01'),
      },
    },
    skills: [
      {
        id: 's8',
        name: 'Продажи B2B',
        category: 'communication',
        level: 4,
        verified: true,
        lastAssessed: new Date('2023-03-20'),
        assessor: 'Семенов М.В.',
        certificationRequired: true,
      },
      {
        id: 's9',
        name: 'Переговоры',
        category: 'soft-skill',
        level: 5,
        verified: true,
        lastAssessed: new Date('2023-03-20'),
        assessor: 'Семенов М.В.',
        certificationRequired: false,
      },
    ],
    reserveSkills: [],
    tags: ['Продажи', 'B2B'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: true,
          push: false,
          scheduleChanges: false,
          announcements: true,
          reminders: false,
        },
        language: 'ru',
        workingHours: {
          start: '09:30',
          end: '18:30',
        },
        schemePreferences: ['Плавающий график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 0,
        adherenceScore: 0,
        customerSatisfaction: 4.6,
        lastEvaluation: new Date('2023-04-10'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2018-02-01'),
        updatedAt: new Date('2024-04-12'),
        createdBy: 'admin_sales',
        lastModifiedBy: 'hr_partner',
        lastLogin: new Date('2024-04-01T18:45:00'),
      },
      personnelNumber: 'PN-004',
      actualAddress: 'г. Бишкек, ул. Советская 3',
      tasks: ['Поддержка ключевых клиентов', 'Подготовка коммерческих предложений'],
    },
  {
    id: 'emp_005',
    employeeId: 'EMP005',
    status: 'active',
    personalInfo: {
      firstName: 'Сергей',
      lastName: 'Никитин',
      middleName: 'Павлович',
      email: 'sergey.nikitin@company.com',
      phone: '+996500778899',
      photo: 'https://i.pravatar.cc/150?img=21',
      address: 'г. Бишкек, мкр. Джал 24-17',
    },
    credentials: {
      wfmLogin: 's.nikitin',
      externalLogins: ['scheduler', 'crm'],
      passwordSet: true,
      passwordLastUpdated: new Date('2024-06-03'),
    },
    workInfo: {
      position: 'Сменный супервайзер',
      team: { ...TEAM_PRESETS.operations },
      manager: 'Чжао Л.А.',
      hireDate: new Date('2020-11-01'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'Операционный центр',
    },
    orgPlacement: {
      orgUnit: 'Сменное управление',
      office: 'Офис Бишкек',
      timeZone: 'Asia/Bishkek',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-operations-shift',
        name: 'Сменный график 2/2',
        effectiveFrom: new Date('2021-02-01'),
      },
    },
    skills: [
      {
        id: 's10',
        name: 'Управление сменой',
        category: 'soft-skill',
        level: 4,
        verified: true,
        lastAssessed: new Date('2024-06-01'),
        assessor: 'Чжао Л.А.',
        certificationRequired: false,
      },
      {
        id: 's11',
        name: 'Анализ нагрузки',
        category: 'technical',
        level: 4,
        verified: true,
        lastAssessed: new Date('2024-05-15'),
        assessor: 'Чжао Л.А.',
        certificationRequired: true,
      },
    ],
    reserveSkills: [
      {
        id: 's12',
        name: 'Обработка инцидентов',
        category: 'product',
        level: 3,
        verified: false,
        lastAssessed: new Date('2023-12-03'),
        assessor: 'Чжао Л.А.',
        certificationRequired: false,
      },
    ],
    tags: ['Супервайзер', 'Дневные смены'],
      preferences: {
        preferredShifts: ['day', 'night'],
        notifications: {
          email: true,
          sms: true,
          push: true,
          scheduleChanges: true,
          announcements: true,
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '07:00',
          end: '19:00',
        },
        schemePreferences: ['Сменный график 2/2'],
      },
      performance: {
        averageHandleTime: 6.1,
        callsPerHour: 0,
        qualityScore: 92,
        adherenceScore: 89,
        customerSatisfaction: 4.7,
        lastEvaluation: new Date('2024-06-10'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2020-10-20'),
        updatedAt: new Date('2024-06-15'),
        createdBy: 'mgr_ops',
        lastModifiedBy: 'mgr_ops',
        lastLogin: new Date('2024-07-02T07:10:00'),
      },
      personnelNumber: 'PN-005',
      actualAddress: 'г. Бишкек, мкр. Джал 24-17',
      tasks: ['Составление сменных графиков', 'Реагирование на инциденты'],
    },
  {
    id: 'emp_006',
    employeeId: 'EMP006',
    status: 'inactive',
    personalInfo: {
      firstName: 'Виктория',
      lastName: 'Жумабаева',
      middleName: 'Рустамовна',
      email: 'victoria.zhumabaeva@company.com',
      phone: '+996509336699',
      photo: 'https://i.pravatar.cc/150?img=28',
      address: 'г. Бишкек, ул. Панфилова 10',
    },
    credentials: {
      wfmLogin: 'v.zhumabaeva',
      externalLogins: ['hr-portal'],
      passwordSet: true,
      passwordLastUpdated: new Date('2022-10-01'),
    },
    workInfo: {
      position: 'HR бизнес-партнер',
      team: { ...TEAM_PRESETS.hr },
      manager: 'Садыкова Г.Р.',
      hireDate: new Date('2019-04-05'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'HR-служба',
    },
    orgPlacement: {
      orgUnit: 'HR',
      office: 'Офис Бишкек',
      timeZone: 'Europe/Moscow',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-hr-flex',
        name: 'Гибридный график',
        effectiveFrom: new Date('2022-01-10'),
      },
    },
    skills: [
      {
        id: 's13',
        name: 'Подбор персонала',
        category: 'soft-skill',
        level: 4,
        verified: true,
        lastAssessed: new Date('2023-09-01'),
        assessor: 'Садыкова Г.Р.',
        certificationRequired: false,
      },
      {
        id: 's14',
        name: 'Адаптация сотрудников',
        category: 'soft-skill',
        level: 4,
        verified: true,
        lastAssessed: new Date('2023-09-01'),
        assessor: 'Садыкова Г.Р.',
        certificationRequired: false,
      },
    ],
    reserveSkills: [],
    tags: ['HR', 'Набор'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: false,
          push: true,
          scheduleChanges: false,
          announcements: true,
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        schemePreferences: ['Гибридный график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 0,
        adherenceScore: 0,
        customerSatisfaction: 4.2,
        lastEvaluation: new Date('2023-12-01'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2019-03-25'),
        updatedAt: new Date('2024-03-12'),
        createdBy: 'admin_hr',
        lastModifiedBy: 'admin_hr',
        lastLogin: new Date('2024-02-28T15:00:00'),
      },
      personnelNumber: 'PN-006',
      actualAddress: 'г. Бишкек, ул. Панфилова 10',
      tasks: ['Подбор персонала', 'Организация адаптации'],
    },
  {
    id: 'emp_007',
    employeeId: 'EMP007',
    status: 'active',
    personalInfo: {
      firstName: 'Арман',
      lastName: 'Жаксылыков',
      middleName: 'Нурсултанович',
      email: 'arman.zhaksylykov@company.com',
      phone: '+996555001144',
      photo: 'https://i.pravatar.cc/150?img=31',
      address: 'г. Алматы, ул. Абая 115',
    },
    credentials: {
      wfmLogin: 'a.zhaksylykov',
      externalLogins: ['sales-crm', 'telegram'],
      passwordSet: true,
      passwordLastUpdated: new Date('2024-05-11'),
    },
    workInfo: {
      position: 'Аккаунт-менеджер',
      team: { ...TEAM_PRESETS.sales },
      manager: 'Семенов М.В.',
      hireDate: new Date('2021-09-15'),
      contractType: 'full-time',
      workLocation: 'Офис Алматы',
      department: 'Продажи B2B',
    },
    orgPlacement: {
      orgUnit: 'Коммерческий блок',
      office: 'Офис Алматы',
      timeZone: 'Asia/Almaty',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-sales-standard',
        name: 'Административный график',
        effectiveFrom: new Date('2021-09-15'),
      },
    },
    skills: [
      {
        id: 's15',
        name: 'Работа с VIP клиентами',
        category: 'communication',
        level: 5,
        verified: true,
        lastAssessed: new Date('2024-05-01'),
        assessor: 'Семенов М.В.',
        certificationRequired: true,
      },
      {
        id: 's16',
        name: 'Английский язык',
        category: 'language',
        level: 4,
        verified: true,
        lastAssessed: new Date('2024-04-20'),
        assessor: 'HR языковой центр',
        certificationRequired: false,
      },
    ],
    reserveSkills: [
      {
        id: 's17',
        name: 'SaaS продажи',
        category: 'product',
        level: 3,
        verified: false,
        lastAssessed: new Date('2023-10-15'),
        assessor: 'Семенов М.В.',
        certificationRequired: false,
      },
    ],
    tags: ['VIP', 'Английский'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: true,
          push: true,
          scheduleChanges: true,
          announcements: true,
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        schemePreferences: ['Административный график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 0,
        adherenceScore: 91,
        customerSatisfaction: 4.9,
        lastEvaluation: new Date('2024-05-25'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2021-09-10'),
        updatedAt: new Date('2024-05-30'),
        createdBy: 'admin_sales',
        lastModifiedBy: 'mgr_sales',
        lastLogin: new Date('2024-06-28T10:20:00'),
      },
      personnelNumber: 'PN-007',
      actualAddress: 'г. Алматы, ул. Абая 115',
      tasks: ['Ведение VIP-клиентов', 'Кросс-продажи'],
    },
  {
    id: 'emp_008',
    employeeId: 'EMP008',
    status: 'vacation',
    personalInfo: {
      firstName: 'Камила',
      lastName: 'Усманова',
      middleName: 'Эркиновна',
      email: 'kamila.usmanova@company.com',
      phone: '+996775998877',
      photo: 'https://i.pravatar.cc/150?img=37',
      address: 'г. Бишкек, ул. Московская 123',
    },
    credentials: {
      wfmLogin: 'k.usmanova',
      externalLogins: ['lms', 'teams'],
      passwordSet: true,
      passwordLastUpdated: new Date('2024-03-01'),
    },
    workInfo: {
      position: 'Тренер контактного центра',
      team: { ...TEAM_PRESETS.training },
      manager: 'Миронова Е.С.',
      hireDate: new Date('2017-01-20'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'Учебный центр',
    },
    orgPlacement: {
      orgUnit: 'Учебный центр',
      office: 'Офис Бишкек',
      timeZone: 'Asia/Bishkek',
      hourNorm: 38,
      workScheme: {
        id: 'scheme-training-flex',
        name: 'Гибридный график',
        effectiveFrom: new Date('2022-09-01'),
      },
    },
    skills: [
      {
        id: 's18',
        name: 'Проведение тренингов',
        category: 'communication',
        level: 5,
        verified: true,
        lastAssessed: new Date('2024-02-12'),
        assessor: 'Миронова Е.С.',
        certificationRequired: false,
      },
      {
        id: 's19',
        name: 'Дизайн обучающих программ',
        category: 'technical',
        level: 4,
        verified: true,
        lastAssessed: new Date('2024-02-12'),
        assessor: 'Миронова Е.С.',
        certificationRequired: false,
      },
    ],
    reserveSkills: [],
    tags: ['Обучение', 'Наставник'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: false,
          push: true,
          scheduleChanges: true,
          announcements: true,
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '09:30',
          end: '18:30',
        },
        schemePreferences: ['Гибридный график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 99,
        adherenceScore: 95,
        customerSatisfaction: 4.8,
        lastEvaluation: new Date('2024-03-10'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2017-01-10'),
        updatedAt: new Date('2024-03-01'),
        createdBy: 'admin_training',
        lastModifiedBy: 'mgr_training',
        lastLogin: new Date('2024-03-05T11:30:00'),
      },
      personnelNumber: 'PN-008',
      actualAddress: 'г. Бишкек, ул. Московская 123',
      tasks: ['Подготовка тренингов', 'Наставничество стажёров'],
    },
  {
    id: 'emp_009',
    employeeId: 'EMP009',
    status: 'probation',
    personalInfo: {
      firstName: 'Анна',
      lastName: 'Мельникова',
      middleName: 'Степановна',
      email: 'anna.melnikova@company.com',
      phone: '+996707554433',
      photo: 'https://i.pravatar.cc/150?img=45',
      address: 'г. Бишкек, ул. Курманжан Датка 18',
    },
    credentials: {
      wfmLogin: 'a.melnikova',
      externalLogins: ['quality', 'analytics'],
      passwordSet: false,
    },
    workInfo: {
      position: 'Аналитик качества',
      team: { ...TEAM_PRESETS.quality },
      manager: 'Горбунов П.С.',
      hireDate: new Date('2024-05-06'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'Контроль качества',
    },
    orgPlacement: {
      orgUnit: 'Служба качества',
      office: 'Офис Бишкек',
      timeZone: 'Asia/Bishkek',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-quality-analyst',
        name: 'Административный график',
        effectiveFrom: new Date('2024-05-06'),
      },
    },
    skills: [
      {
        id: 's20',
        name: 'Power BI',
        category: 'technical',
        level: 3,
        verified: false,
        lastAssessed: new Date('2024-06-01'),
        assessor: 'Горбунов П.С.',
        certificationRequired: false,
      },
      {
        id: 's21',
        name: 'SQL запросы',
        category: 'technical',
        level: 3,
        verified: false,
        lastAssessed: new Date('2024-06-01'),
        assessor: 'Горбунов П.С.',
        certificationRequired: false,
      },
    ],
    reserveSkills: [],
    tags: ['Аналитика', 'Младший специалист'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: false,
          push: true,
          scheduleChanges: true,
          announcements: true,
          reminders: false,
        },
        language: 'ru',
        workingHours: {
          start: '09:00',
          end: '18:00',
        },
        schemePreferences: ['Административный график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 0,
        adherenceScore: 82,
        customerSatisfaction: 4.5,
        lastEvaluation: new Date('2024-06-15'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2024-05-03'),
        updatedAt: new Date('2024-06-18'),
        createdBy: 'mgr_quality',
        lastModifiedBy: 'mentor_quality',
    },
    personnelNumber: 'PN-009',
    actualAddress: 'г. Бишкек, ул. Курманжан Датка 18',
    tasks: ['Анализ данных Power BI', 'Оптимизация отчётности'],
  },
  {
    id: 'emp_010',
    employeeId: 'EMP010',
    status: 'active',
    personalInfo: {
      firstName: 'Дмитрий',
      lastName: 'Лебедев',
      middleName: 'Сергеевич',
      email: 'dmitry.lebedev@company.com',
      phone: '+996709445599',
      photo: 'https://i.pravatar.cc/150?img=52',
      address: 'г. Бишкек, пр. Чуй 142',
    },
    credentials: {
      wfmLogin: 'd.lebedev',
      externalLogins: ['scheduler', 'excel'],
      passwordSet: true,
      passwordLastUpdated: new Date('2024-02-14'),
    },
    workInfo: {
      position: 'Инженер расписаний',
      team: { ...TEAM_PRESETS.operations },
      manager: 'Чжао Л.А.',
      hireDate: new Date('2016-07-12'),
      contractType: 'full-time',
      workLocation: 'Офис Бишкек',
      department: 'Операционный центр',
    },
    orgPlacement: {
      orgUnit: 'Планирование',
      office: 'Офис Бишкек',
      timeZone: 'Europe/Moscow',
      hourNorm: 40,
      workScheme: {
        id: 'scheme-operations-planner',
        name: 'Стандартный график',
        effectiveFrom: new Date('2016-07-12'),
      },
    },
    skills: [
      {
        id: 's22',
        name: 'Оптимизация расписаний',
        category: 'technical',
        level: 5,
        verified: true,
        lastAssessed: new Date('2024-02-01'),
        assessor: 'Чжао Л.А.',
        certificationRequired: true,
      },
      {
        id: 's23',
        name: 'Excel продвинутый',
        category: 'technical',
        level: 5,
        verified: true,
        lastAssessed: new Date('2024-02-01'),
        assessor: 'Чжао Л.А.',
        certificationRequired: false,
      },
    ],
    reserveSkills: [
      {
        id: 's24',
        name: 'Python автоматизация',
        category: 'technical',
        level: 3,
        verified: false,
        lastAssessed: new Date('2023-11-18'),
        assessor: 'Чжао Л.А.',
        certificationRequired: false,
      },
    ],
    tags: ['Расписание', 'Excel'],
      preferences: {
        preferredShifts: ['day'],
        notifications: {
          email: true,
          sms: true,
          push: true,
          scheduleChanges: true,
          announcements: true,
          reminders: true,
        },
        language: 'ru',
        workingHours: {
          start: '08:30',
          end: '17:30',
        },
        schemePreferences: ['Стандартный график'],
      },
      performance: {
        averageHandleTime: 0,
        callsPerHour: 0,
        qualityScore: 95,
        adherenceScore: 93,
        customerSatisfaction: 4.9,
        lastEvaluation: new Date('2024-02-10'),
      },
      certifications: [],
      metadata: {
        createdAt: new Date('2016-07-01'),
        updatedAt: new Date('2024-04-05'),
        createdBy: 'admin_ops',
        lastModifiedBy: 'mgr_ops',
        lastLogin: new Date('2024-04-20T08:10:00'),
      },
      personnelNumber: 'PN-010',
      actualAddress: 'г. Бишкек, пр. Чуй 142',
      tasks: ['Оптимизация расписаний', 'Ведение отчётности по загрузке'],
    },
];

const App: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [currentView, setCurrentView] = useState<string>('list');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [focusEmployeeId, setFocusEmployeeId] = useState<string | null>(null);

  const teams: Team[] = useMemo(() => {
    const unique = new Map<string, Team>();
    employees.forEach((employee) => {
      unique.set(employee.workInfo.team.id, employee.workInfo.team);
    });
    return Array.from(unique.values());
  }, [employees]);

  const handleEmployeesChange = useCallback((updater: (prev: Employee[]) => Employee[]) => {
    setEmployees((prev) => updater(prev));
  }, []);

  const handleQuickAddOpen = useCallback(() => {
    setIsQuickAddOpen(true);
    setCurrentView('list');
  }, []);

  const handleQuickAddClose = useCallback(() => {
    setIsQuickAddOpen(false);
  }, []);

  const handleQuickAddSubmit = useCallback((draft: Omit<Employee, 'id' | 'metadata'>) => {
    const timestamp = Date.now();
    const newEmployee: Employee = {
      ...draft,
      id: `emp_${timestamp}`,
      metadata: {
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
        createdBy: 'agent',
        lastModifiedBy: 'agent',
      },
    };

    setEmployees((prev) => [newEmployee, ...prev]);
    setIsQuickAddOpen(false);
    setFocusEmployeeId(newEmployee.id);
    setCurrentView('list');
  }, []);

  useEffect(() => {
    if (!focusEmployeeId) {
      return undefined;
    }
    const timeout = window.setTimeout(() => setFocusEmployeeId(null), 1500);
    return () => window.clearTimeout(timeout);
  }, [focusEmployeeId]);

  const views = [
    { id: 'list', label: 'Список сотрудников', icon: '📋' },
    { id: 'gallery', label: 'Фото галерея (демо)', icon: '🖼️' },
    { id: 'performance', label: 'Показатели (демо)', icon: '📈' },
    { id: 'statusManager', label: 'Статусы (демо)', icon: '✅' },
    { id: 'certifications', label: 'Сертификации (демо)', icon: '🎓' },
    { id: 'skills', label: 'Навыки (демо)', icon: '🎯' },
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
              <h1 className="text-xl font-semibold text-gray-900">Управление сотрудниками - 1010.ru</h1>
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
                <span aria-hidden>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-blue-50 border-b border-blue-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-sm text-blue-800">
            <strong>Текущий раздел:</strong> {views.find((view) => view.id === currentView)?.label}
          </span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'list' && (
          <EmployeeListContainer
            employees={employees}
            onEmployeesChange={handleEmployeesChange}
            onOpenQuickAdd={handleQuickAddOpen}
            focusEmployeeId={focusEmployeeId}
          />
        )}
        {currentView === 'gallery' && <EmployeePhotoGallery employees={employees} teams={teams} />}
        {currentView === 'performance' && <PerformanceMetricsView employees={employees} />}
        {currentView === 'statusManager' && <EmployeeStatusManager employees={employees} />}
        {currentView === 'certifications' && <CertificationTracker employees={employees} />}
        {currentView === 'skills' && (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Навыки</h3>
            <p className="text-gray-500">Компонент управления навыками в разработке</p>
          </div>
        )}
      </main>

      <QuickAddEmployee
        teams={teams}
        isOpen={isQuickAddOpen}
        onClose={handleQuickAddClose}
        onSubmit={handleQuickAddSubmit}
      />
    </div>
  );
};

export default App;
