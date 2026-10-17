/// <reference types="vitest/config" />
import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const src = fileURLToPath(new URL('./src', import.meta.url));

function gitCommit() {
  // Vercel Git 연동 빌드는 .git 없이 이 값을 준다
  if (process.env.VERCEL_GIT_COMMIT_SHA) return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'local';
  }
}

export default defineConfig({
  plugins: [react()],
  // 포트폴리오 패널에 보일 빌드 정보
  define: {
    __APP_COMMIT__: JSON.stringify(gitCommit()),
    __APP_BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  resolve: { alias: { '@': src } },
  build: {
    rollupOptions: {
      // 앱(index.html)과 컴포넌트 쇼케이스(showcase/index.html)를 따로 빌드한다.
      input: {
        app: fileURLToPath(new URL('./index.html', import.meta.url)),
        showcase: fileURLToPath(new URL('./showcase/index.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
});
