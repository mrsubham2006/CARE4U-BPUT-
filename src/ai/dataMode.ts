export type DataMode = 'demo' | 'live';

const DATA_MODE_KEY = 'healthai_data_mode';

export class DataModeService {
  private static currentMode: DataMode = 'demo';

  public static getMode(): DataMode {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(DATA_MODE_KEY);
      if (saved === 'live' || saved === 'demo') {
        this.currentMode = saved;
      }
    }
    return this.currentMode;
  }

  public static setMode(mode: DataMode): void {
    this.currentMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(DATA_MODE_KEY, mode);
    }
  }

  public static isDemo(): boolean {
    return this.getMode() === 'demo';
  }

  public static isLive(): boolean {
    return this.getMode() === 'live';
  }
}
