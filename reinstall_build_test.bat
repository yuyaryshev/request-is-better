cls
rm -rf node_modules
rm -rf pnpm-lock.yaml
rmdir node_modules /Q /S
del pnpm-lock.yaml
pnpm i
pnpm i
npm run build
