export declare class HealthController {
    health(): {
        status: string;
        timestamp: string;
        uptime: number;
    };
    root(): {
        name: string;
        version: string;
        docs: string;
    };
}
