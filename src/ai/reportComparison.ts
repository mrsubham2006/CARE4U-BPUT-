import { LabOrder, LabParameter } from '../types';

export interface MetricComparisonItem {
  parameterName: string;
  previousValue: string;
  latestValue: string;
  unit: string;
  trend: 'STABLE' | 'INCREASED' | 'DECREASED' | 'NEW';
  statusFlag: 'NORMAL' | 'HIGH' | 'LOW';
}

export interface ReportComparisonResult {
  previousReportTitle: string;
  latestReportTitle: string;
  previousDate: string;
  latestDate: string;
  metrics: MetricComparisonItem[];
  trendSummary: string;
  clinicalNote: string;
}

export class HealthReportComparison {
  public static compare(previousReport: LabOrder, latestReport: LabOrder): ReportComparisonResult {
    const prevMap = new Map<string, LabParameter>();
    (previousReport.parameters || []).forEach(p => prevMap.set(p.parameterName.toLowerCase(), p));

    const metrics: MetricComparisonItem[] = [];

    (latestReport.parameters || []).forEach(latestParam => {
      const prevParam = prevMap.get(latestParam.parameterName.toLowerCase());

      if (prevParam) {
        const prevNum = parseFloat(String(prevParam.value));
        const latestNum = parseFloat(String(latestParam.value));

        let trend: 'STABLE' | 'INCREASED' | 'DECREASED' = 'STABLE';
        if (!isNaN(prevNum) && !isNaN(latestNum)) {
          if (latestNum > prevNum * 1.05) trend = 'INCREASED';
          else if (latestNum < prevNum * 0.95) trend = 'DECREASED';
        }

        metrics.push({
          parameterName: latestParam.parameterName,
          previousValue: String(prevParam.value),
          latestValue: String(latestParam.value),
          unit: latestParam.unit,
          trend,
          statusFlag: (latestParam.flag === 'HIGH' || latestParam.flag === 'LOW') ? latestParam.flag : 'NORMAL'
        });
      } else {
        metrics.push({
          parameterName: latestParam.parameterName,
          previousValue: 'N/A',
          latestValue: String(latestParam.value),
          unit: latestParam.unit,
          trend: 'NEW',
          statusFlag: (latestParam.flag === 'HIGH' || latestParam.flag === 'LOW') ? latestParam.flag : 'NORMAL'
        });
      }
    });

    const changedCount = metrics.filter(m => m.trend !== 'STABLE').length;

    const trendSummary = changedCount === 0
      ? 'All tracked biochemical markers remain consistent and stable between both consultations.'
      : `${changedCount} markers show variance between dates. Review with your treating physician during your next scheduled consultation.`;

    return {
      previousReportTitle: previousReport.testName,
      latestReportTitle: latestReport.testName,
      previousDate: new Date(previousReport.createdAt || Date.now()).toLocaleDateString(),
      latestDate: new Date(latestReport.createdAt || Date.now()).toLocaleDateString(),
      metrics,
      trendSummary,
      clinicalNote:
        'Biomarker trends provide longitudinal context for clinical decision-making. Never alter prescribed therapies without physician confirmation.'
    };
  }
}
