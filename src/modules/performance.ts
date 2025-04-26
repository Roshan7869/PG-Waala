type MetricEntry = {
    startTime: number;
    endTime?: number;
    duration?: number;
    metadata?: Record<string, any>;
};

class PerformanceMonitor {
    private metrics: Map<string, MetricEntry[]> = new Map();
    private thresholds: Map<string, number> = new Map();
    private readonly defaultThreshold = 100; // ms

    constructor() {
        // Set default thresholds for common operations
        this.thresholds.set('filter', 50);
        this.thresholds.set('render', 100);
        this.thresholds.set('dataLoad', 1000);
    }

    start(label: string, metadata?: Record<string, any>): void {
        if (!this.metrics.has(label)) {
            this.metrics.set(label, []);
        }
        
        this.metrics.get(label)?.push({
            startTime: performance.now(),
            metadata
        });
    }

    end(label: string): number {
        const entries = this.metrics.get(label);
        if (!entries || entries.length === 0) {
            console.warn(`No active measurement for label: ${label}`);
            return 0;
        }

        const currentEntry = entries[entries.length - 1];
        currentEntry.endTime = performance.now();
        currentEntry.duration = currentEntry.endTime - currentEntry.startTime;

        // Check threshold
        const threshold = this.thresholds.get(label) || this.defaultThreshold;
        if (currentEntry.duration > threshold) {
            console.warn(
                `Performance warning: ${label} took ${currentEntry.duration.toFixed(2)}ms`,
                currentEntry.metadata || ''
            );
        }

        return currentEntry.duration;
    }

    getMetrics(label?: string): Record<string, any> {
        if (label) {
            const entries = this.metrics.get(label);
            if (!entries) return {};

            return {
                count: entries.length,
                totalDuration: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
                averageDuration: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / entries.length,
                maxDuration: Math.max(...entries.map(entry => entry.duration || 0)),
                minDuration: Math.min(...entries.map(entry => entry.duration || 0))
            };
        }

        const allMetrics: Record<string, any> = {};
        this.metrics.forEach((entries, key) => {
            allMetrics[key] = {
                count: entries.length,
                totalDuration: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0),
                averageDuration: entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / entries.length,
                maxDuration: Math.max(...entries.map(entry => entry.duration || 0)),
                minDuration: Math.min(...entries.map(entry => entry.duration || 0))
            };
        });

        return allMetrics;
    }

    setThreshold(label: string, threshold: number): void {
        this.thresholds.set(label, threshold);
    }

    clearMetrics(label?: string): void {
        if (label) {
            this.metrics.delete(label);
        } else {
            this.metrics.clear();
        }
    }

    async measure<T>(label: string, fn: () => Promise<T> | T, metadata?: Record<string, any>): Promise<T> {
        this.start(label, metadata);
        try {
            const result = await fn();
            this.end(label);
            return result;
        } catch (error) {
            this.end(label);
            throw error;
        }
    }
}

export const performanceMonitor = new PerformanceMonitor(); 