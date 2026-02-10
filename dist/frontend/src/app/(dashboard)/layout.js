'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardLayout;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const sidebar_1 = require("@/components/layout/sidebar");
const use_auth_store_1 = require("@/store/use-auth-store");
const lucide_react_1 = require("lucide-react");
function DashboardLayout({ children, }) {
    const { isAuthenticated, isLoading } = (0, use_auth_store_1.useAuthStore)();
    const router = (0, navigation_1.useRouter)();
    const [isClient, setIsClient] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setIsClient(true);
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isLoading, isAuthenticated, router]);
    if (!isClient || isLoading) {
        return (<div className="flex h-screen items-center justify-center">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>);
    }
    if (!isAuthenticated)
        return null;
    return (<div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <sidebar_1.Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-950">
        {children}
      </main>
    </div>);
}
//# sourceMappingURL=layout.js.map