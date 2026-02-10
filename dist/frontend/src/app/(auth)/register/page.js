'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegisterPage;
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const z = __importStar(require("zod"));
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const use_auth_store_1 = require("@/store/use-auth-store");
const button_1 = require("@/components/ui/button");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    tenantName: z.string().min(2, 'Organization name is required'),
});
function RegisterPage() {
    const router = (0, navigation_1.useRouter)();
    const register = (0, use_auth_store_1.useAuthStore)((state) => state.register);
    const isLoading = (0, use_auth_store_1.useAuthStore)((state) => state.isLoading);
    const authError = (0, use_auth_store_1.useAuthStore)((state) => state.error);
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            tenantName: '',
        },
    });
    async function onSubmit(values) {
        try {
            await register(values);
            router.push('/chat');
        }
        catch (error) {
        }
    }
    return (<card_1.Card>
      <card_1.CardHeader className="space-y-1">
        <card_1.CardTitle className="text-2xl font-bold">Create an account</card_1.CardTitle>
        <card_1.CardDescription>
          Enter your details to create your organization workspace
        </card_1.CardDescription>
      </card_1.CardHeader>
      <card_1.CardContent>
        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <form_1.FormField control={form.control} name="name" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Full Name</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="John Doe" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
             <form_1.FormField control={form.control} name="tenantName" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Organization Name</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="Acme Inc." {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
            <form_1.FormField control={form.control} name="email" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Email</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="name@example.com" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
            <form_1.FormField control={form.control} name="password" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Password</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input type="password" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
            
            {authError && (<div className="text-sm text-red-500 font-medium">
                {authError}
              </div>)}
            
            <button_1.Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading && <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Create Account
            </button_1.Button>
          </form>
        </form_1.Form>
      </card_1.CardContent>
      <card_1.CardFooter className="justify-center">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <link_1.default href="/login" className="text-primary hover:underline">
            Sign in
          </link_1.default>
        </p>
      </card_1.CardFooter>
    </card_1.Card>);
}
//# sourceMappingURL=page.js.map