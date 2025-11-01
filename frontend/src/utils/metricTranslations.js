// Helper function to get translated metric configuration
export const getTranslatedMetrics = (t) => ({
  // Primary Metrics
  paymentPercentage: {
    key: 'paymentPercentage',
    title: t('metricTitles.paymentTimeliness'),
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 25, '#f59e0b', 50, '#eab308', 75, '#84cc16', 100, '#10b981'],
    icon: '⏱️',
    category: 'primary'
  },
  averageDays: {
    key: 'averageDays',
    title: t('metricTitles.averagePaymentDays'),
    unit: ` ${t('common.days')}`,
    format: (val) => `${Math.round(val)} ${t('common.days')}`,
    colorStops: [0, '#10b981', 25, '#84cc16', 50, '#eab308', 75, '#f59e0b', 100, '#ef4444', 105, '#dc2626'],
    icon: '📅',
    category: 'primary'
  },
  womenParticipation: {
    key: 'womenParticipationPercent',
    title: t('metricTitles.womenParticipation'),
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 25, '#f59e0b', 50, '#eab308', 75, '#84cc16', 100, '#10b981'],
    icon: '👤',
    category: 'primary'
  },
  
  // Advanced Metrics
  households100Days: {
    key: 'households100DaysPercent',
    title: t('metricTitles.households100Days'),
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 5, '#f59e0b', 10, '#eab308', 15, '#84cc16', 20, '#10b981'],
    icon: '💯',
    category: 'advanced'
  },
  scstParticipation: {
    key: 'scstParticipationPercent',
    title: t('metricTitles.scstParticipation'),
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 15, '#f59e0b', 30, '#eab308', 45, '#84cc16', 60, '#10b981'],
    icon: '🤝',
    category: 'advanced'
  },
  workCompletion: {
    key: 'workCompletionPercent',
    title: t('metricTitles.workCompletionRate'),
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 25, '#f59e0b', 50, '#eab308', 75, '#84cc16', 100, '#10b981'],
    icon: '✅',
    category: 'advanced'
  },
  averageWage: {
    key: 'averageWageRate',
    title: t('metricTitles.averageWageRate'),
    unit: '/day',
    format: (val) => `₹${Math.round(val)}`,
    colorStops: [0, '#dc2626', 150, '#ef4444', 200, '#f59e0b', 250, '#eab308', 300, '#84cc16', 350, '#10b981'],
    icon: '💵',
    category: 'advanced'
  },
  agricultureWorks: {
    key: 'agricultureWorksPercent',
    title: t('metricTitles.agricultureWorks'),
    unit: '%',
    format: (val) => `${val.toFixed(1)}%`,
    colorStops: [0, '#dc2626', 0.1, '#ef4444', 20, '#f59e0b', 40, '#eab308', 60, '#84cc16', 80, '#10b981'],
    icon: '🌾',
    category: 'advanced'
  }
});
