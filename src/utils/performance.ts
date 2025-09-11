// Performance monitoring utilities
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();
  private static enabled = __DEV__; // Only enabled in development

  static start(operation: string): () => void {
    if (!this.enabled) return () => {};
    
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      const existing = this.measurements.get(operation) || [];
      this.measurements.set(operation, [...existing, duration]);
      
      if (existing.length >= 10) {
        const avg = existing.reduce((a, b) => a + b, 0) / existing.length;
        console.log(`⏱️ ${operation}: ${avg.toFixed(1)}ms avg (${existing.length} samples)`);
        this.measurements.set(operation, []);
      }
    };
  }

  static logSlowOperation(operation: string, threshold: number = 100): () => void {
    if (!this.enabled) return () => {};
    
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (duration > threshold) {
        console.warn(`🐌 Slow operation: ${operation} took ${duration.toFixed(0)}ms`);
      }
    };
  }

  static clear() {
    this.measurements.clear();
  }
}

// Hook to measure component render performance
export const useRenderPerformance = (componentName: string) => {
  if (!__DEV__) return;
  
  React.useEffect(() => {
    const endMeasurement = PerformanceMonitor.start(`render:${componentName}`);
    return endMeasurement;
  }, [componentName]);
};