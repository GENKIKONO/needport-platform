const req = ["NEXT_PUBLIC_ROOT_DOMAIN","NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY","CLERK_SECRET_KEY","STRIPE_SECRET_KEY","SENTRY_DSN"];
const miss = req.filter(k=>!process.env[k]);
if(miss.length){ console.error("Missing env:", miss.join(", ")); process.exit(1); }
console.log("[OK] env sane");
