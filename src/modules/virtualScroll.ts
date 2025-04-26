import { performanceMonitor } from './performance';
import { PG } from '../types';

interface VirtualScrollConfig {
    itemHeight: number;
    containerHeight: number;
    overscan: number;
    batchSize: number;
}

export class VirtualScroll {
    private config: VirtualScrollConfig;
    private items: PG[] = [];
    private container: HTMLElement | null = null;
    private scrollTop: number = 0;
    private renderCallback: ((items: PG[]) => void) | null = null;
    private resizeObserver: ResizeObserver | null = null;
    private scrollHandler: (() => void) | null = null;
    private scheduledUpdate: number | null = null;

    constructor(config: Partial<VirtualScrollConfig> = {}) {
        this.config = {
            itemHeight: config.itemHeight || 200, // Default height for PG cards
            containerHeight: config.containerHeight || window.innerHeight,
            overscan: config.overscan || 3, // Number of items to render above/below viewport
            batchSize: config.batchSize || 20 // Number of items to render in each batch
        };
    }

    initialize(container: HTMLElement, items: PG[], renderCallback: (items: PG[]) => void): void {
        this.container = container;
        this.items = items;
        this.renderCallback = renderCallback;

        // Set up container
        this.container.style.position = 'relative';
        this.container.style.height = `${this.getTotalHeight()}px`;

        // Set up resize observer
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === this.container) {
                    this.config.containerHeight = entry.contentRect.height;
                    this.scheduleUpdate();
                }
            }
        });
        this.resizeObserver.observe(this.container);

        // Set up scroll handler
        this.scrollHandler = () => this.handleScroll();
        window.addEventListener('scroll', this.scrollHandler, { passive: true });

        // Initial render
        this.render();
    }

    private handleScroll(): void {
        if (!this.container) return;

        const rect = this.container.getBoundingClientRect();
        this.scrollTop = window.pageYOffset - rect.top;
        this.scheduleUpdate();
    }

    private scheduleUpdate(): void {
        if (this.scheduledUpdate !== null) {
            cancelAnimationFrame(this.scheduledUpdate);
        }
        this.scheduledUpdate = requestAnimationFrame(() => this.render());
    }

    private async render(): Promise<void> {
        await performanceMonitor.measure('virtual-scroll-render', async () => {
            if (!this.container || !this.renderCallback) return;

            const { start, end } = this.getVisibleRange();
            const visibleItems = this.items.slice(start, end);

            // Create placeholder elements for proper scrolling
            const topOffset = start * this.config.itemHeight;
            const bottomOffset = (this.items.length - end) * this.config.itemHeight;

            // Update container style
            this.container.style.paddingTop = `${topOffset}px`;
            this.container.style.paddingBottom = `${bottomOffset}px`;

            // Render visible items
            this.renderCallback(visibleItems);
        });
    }

    private getVisibleRange(): { start: number; end: number } {
        const start = Math.max(
            0,
            Math.floor(this.scrollTop / this.config.itemHeight) - this.config.overscan
        );
        const end = Math.min(
            this.items.length,
            Math.ceil((this.scrollTop + this.config.containerHeight) / this.config.itemHeight) + this.config.overscan
        );

        return { start, end };
    }

    private getTotalHeight(): number {
        return this.items.length * this.config.itemHeight;
    }

    updateItems(newItems: PG[]): void {
        this.items = newItems;
        this.container!.style.height = `${this.getTotalHeight()}px`;
        this.scheduleUpdate();
    }

    destroy(): void {
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        if (this.resizeObserver && this.container) {
            this.resizeObserver.unobserve(this.container);
            this.resizeObserver.disconnect();
        }
        if (this.scheduledUpdate !== null) {
            cancelAnimationFrame(this.scheduledUpdate);
        }
    }
}

export const createVirtualScroll = (config?: Partial<VirtualScrollConfig>): VirtualScroll => {
    return new VirtualScroll(config);
}; 